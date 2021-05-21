const { fetchData } = require('../utils/fetching.js');
const { parseExcelFile, parseJSONFile } = require('../utils/excelParsing.js');
const Resource = require('../../../models/data/ResourceModel.js');

// creates new Resource object (or fetches existing one from database)
var createResource = async (resource, dataset_id) => {
    // fetch resource from database (if exists)
    let newResource = await Resource.fetchResourceById(resource.id);

    let dateOfIssue = new Date(resource.created);
    let lastModified = new Date(resource.last_modified);

    let result = null;
    // if resource doesn't exists in database create a new one
    if (!newResource) {
        result = await getUrlData(resource.url, resource.format);
        let data = {
            object_id: resource.id, changed: true, dataset_id: dataset_id, revision_id: resource.revision_id,
            name: resource.name, size: resource.size, format: resource.format, media_type: result.mediaType,
            state: resource.state, description: resource.description, created: dateOfIssue,
            last_modified: lastModified, actually_last_modified: result.actuallyLastModified,
            empty_rows: result.emptyRows, url: resource.url
        }
        // create new Resource object by the loaded data
        newResource = new Resource(data);
        await newResource.persist();
    } else {
        // if exists in database => check if same lastModified timestamp
        let savedLastModified = new Date(newResource.last_modified);
        // if last modified timestamps are almost equal continue, else update
        if (lastModified && (lastModified - savedLastModified >= 45)) {
            result = getUrlData(resource.url, resource.format);
            // update all info that can be updated about this resource
            let dataForUpdate = {
                revision_id: resource.revision_id, name: resource.name, size: resource.size,
                format: resource.format, media_type: result.mediaType, state: resource.state,
                description: resource.description, created: dateOfIssue, last_modified: lastModified,
                actually_last_modified: result.actuallyLastModified, empty_rows: result.emptyRows,
                url: resource.url
            }
            await newResource.update(dataForUpdate);
        }
    }
    return newResource;
};

// returns mediaType, when was media lastModified and percentage of emptyRows in file (if needed)
var getUrlData = async (url, format) => {
    let mediaType = null;
    let emptyRows = null;
    // if URL exists => check what we want
    if (url) {
        var urlData = await fetchData(url); //fetch URL data
        if (urlData) {
            // error while fetching resource
            if (urlData.error || !urlData.status || urlData.status.code >= 400) {
                ;
            } else {
                if (urlData.extension == 'shp' && format.toLowerCase() == 'shx') {
                    urlData.extension = 'shx'; // because .shp and .shx has the same content type
                }
                mediaType = urlData.extension;
                emptyRows = checkEmptyRows(urlData); //count empty rows (if needed)
            }
        }
    }
    return {
        mediaType: mediaType, //type of media (extension of the media)
        lastModified: urlData ? urlData.lastModified : null, //when was the file actually last modified
        emptyRows: emptyRows //percentage of empty rows in file
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
        // get percentage of empty rows in file
        if (fileStats) percentage = fileStats.blankRows / fileStats.numOfRows * 100;
    }
    return percentage;
}

module.exports = {
    createResource
};