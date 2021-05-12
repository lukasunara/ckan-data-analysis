const { fetchData } = require('./fetching.js');
const { parseExcelFile, parseJSONFile } = require('./excelParsing.js');
const {
    analyseParam,
    analyseDate,
    checkParam
} = require('./analysis.js');
const Resource = require('../../models/data/ResourceModel.js');

var numOfParams, numOfBadParams;
var index;
var missingParams = [];

// sends param to a check function 
var sendParam = (checkFunction, key, param1, param2) => {
    numOfParams++;

    let exists;
    if (!param2) {
        exists = analyseParam(param1, checkFunction);
    } else {
        exists = analyseParamWithOption(param1, param2, checkFunction);
    }

    if (!exists) {
        missingParams[index++] = key;
        numOfBadParams++;
    }

    return exists;
}

var analyseResource = async (resource) => {
    /*
    1. provjeri parametre
    2. spremi u bazu podataka info o organizaciji i svim chartovima
    */
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];

    sendParam(checkParam, 'name', resource.name);
    sendParam(checkParam, 'id', resource.id);
    sendParam(checkParam, 'revision_id', resource.revision_id);
    sendParam(checkParam, 'size', resource.size);
    sendParam(checkParam, 'format', resource.format);
    sendParam(checkParam, 'state', resource.state);
    sendParam(checkParam, 'description', resource.description);
    sendParam(checkParam, 'last_modified', resource.last_modified);

    // get when was the metadata last modified
    let metadataLastModified = analyseDate(resource.last_modified);
    if (metadataLastModified < 0) {
        var lastModified = new Date(resource.created);
        metadataLastModified = analyseDate(resource.created);
    } else {
        var lastModified = new Date(resource.last_modified);
    }

    // check the download url for this resource
    let downloadUrlExists = sendParam(checkParam, 'url', resource.url);
    if (downloadUrlExists) {
        var urlData = await fetchData(resource.url);

        if (urlData.error || urlData.status.code >= 400) {  // error while fetching resource
            var download = {
                error: true, // it is an error
                status: urlData.status, // error status code
                statusText: urlData.statusText // error status text
            }
        } else {
            var download = {
                format: urlData.extension, // actual format of fetched resource
                status: urlData.status, // response status code
                lastModified: urlData.lastModified, // date when resource was actually last modified
                lastModifiedMonths: analyseDate(urlData.lastModified) // date in months difference
            };
            // count blank rows in resource data
            var fileStats;
            if (urlData.extension == 'xls' || urlData.extension == 'xlsx' ||
                urlData.extension == 'csv' || urlData.extension == 'xml'
            ) {
                fileStats = parseExcelFile(urlData.data, urlData.extension);
            } else if (urlData.extension == 'json') {
                fileStats = parseJSONFile(urlData.data, urlData.extension);
            } else if (urlData.extension == 'shp' && resource.format.toLowerCase() == 'shx') {
                urlData.extension = 'shx'; // because .shp and .shx has the same content type
            }
        }
    }

    return {
        numbers: {
            numOfParams: numOfParams, // total number of parameters
            numOfBadParams: numOfBadParams // number of missing or "empty" parameters
        },
        missingParams: missingParams, // list of all missing parameters
        dates: {
            lastModified: lastModified, // actual date
            lastModifiedMonths: metadataLastModified, // date when the metadata was last modified
        },
        download: download, // info about download url response
        fileStats: fileStats // number of blank rows out of total number of rows
    }
}

var createResource = async (resource, dataset_id) => {
    let changed = false;

    let newResource = Resource.fetchResourceById(resource.id);
    if (!newResource) {
        console.log('Should not be here! Ever!');
        let result = await getUrlData(resource.url, resource.format);
        let mediaType = result.mediaType;
        let dateOfIssue = new Date(resource.created);
        let lastModified = new Date(resource.last_modified);

        newResource = new Resource(resource.id, dataset_id, resource.revision_id,
            resource.name, resource.size, resource.format, mediaType, resource.state,
            resource.description, dateOfIssue, lastModified, resource.url
        );
        changed = true;
        newResource.actuallyLastModified = result.lastModified;
        newResource.emptyRows = result.emptyRows;
    } else {
        let lastModified = new Date(resource.last_modified);
        let savedLastModified = new Date(newDataset.lastModified);
        // if last modified timestamps are almost equal continue, else update
        if (lastModified && (lastModified - savedLastModified >= 45)) {
            let result = getUrlData(resource.url, resource.format);
            let mediaType = result.mediaType;

            await newResource.updateResourceData(
                lastModified, resource.size, resource.format, mediaType, resource.url
            );
            changed = true;
            newResource.actuallyLastModified = result.lastModified;
            newResource.emptyRows = result.emptyRows;
        }
    }
    return { newResource: newResource, changed: changed };
};

// returns mediaType
var getUrlData = async (url, format) => {
    let mediaType = null;
    let emptyRows = null;
    if (url) {
        var urlData = await fetchData(url);
        if (urlData.error || urlData.status.code >= 400) {  // error while fetching resource
            ;
        } else {
            if (urlData.extension.toLowerCase() == 'shp' && format.toLowerCase() == 'shx') {
                urlData.extension = 'shx'; // because .shp and .shx has the same content type
            }
            mediaType = urlData.extension;
            emptyRows = checkEmptyRows(urlData);
        }
    }
    return {
        mediaType: mediaType,
        lastModified: urlData.lastModified,
        emptyRows: emptyRows
    };
};

// checks empty rows in a file (if the file can be read by xlsx extension)
var checkEmptyRows = (urlData) => {
    let percentage = null;
    if (!urlData.error && urlData.data !== undefined) {
        // count blank rows in resource data
        let fileStats;
        if (urlData.extension == 'xls' || urlData.extension == 'xlsx' ||
            urlData.extension == 'csv' || urlData.extension == 'xml'
        ) {
            fileStats = parseExcelFile(urlData.data, urlData.extension);
        } else if (urlData.extension == 'json') {
            fileStats = parseJSONFile(urlData.data, urlData.extension);
        }
        percentage = fileStats.blankRows / fileStats.numOfRows * 100;
    }
    return percentage;
}

module.exports = {
    analyseResource, createResource
};