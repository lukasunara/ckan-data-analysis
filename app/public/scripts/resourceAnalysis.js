const { fetchData } = require('./fetching.js');
const { parseExcelFile, parseJSONFile } = require('./excelParsing.js');
const {
    analyseParam,
    analyseDate,
    checkParam
} = require('./analysis.js');

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

    // get when was the metadata last modified
    let metadataLastModified = analyseDate(resource.last_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(resource.created);
    }

    // check the download url for this resource
    let downloadUrlExists = sendParam(checkParam, 'url', resource.url);
    if (downloadUrlExists) {
        var urlData = await fetchData(resource.url);

        if (urlData.error) {  // error while fetching resource
            var download = {
                error: true, // it is an error
                status: urlData.status, // error status code
                statusText: urlData.statusText // error status text
            }
        } else {
            var download = {
                format: urlData.extension, // actual format of fetched resource
                status: urlData.status, // response status code
                lastModified: urlData.lastModified // date when resource was actually last modified
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
        lastModified: metadataLastModified, // date when the metadata was last modified
        download: download, // info about downloadd url response
        fileStats: fileStats // number of blank rows out of total number of rows
    }
}

module.exports = {
    analyseResource
};