const { fetchData } = require('./fetching.js');
const { analyseResource } = require('./resourceAnalysis.js');
const {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
} = require('./analysis.js');

var numOfParams, numOfBadParams;
var index;
var missingParams = [];
var resourcesStats = {
    numOfParams,
    numOfBadParams,
    formats,
    numOfErrors
};


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

// analyse one dataset
var analyseDataset = async (dataset) => {
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];
    resourcesStats.numOfParams = 0;
    resourcesStats.numOfBadParams = 0;
    resourcesStats.numOfErrors = 0;

    sendParam(checkParam, 'title', dataset.title);
    sendParam(checkParam, 'name', dataset.name);
    sendParam(checkParam, 'id', dataset.id);
    sendParam(checkParam, 'author', dataset.author);
    sendParam(checkParam, 'maintainer', dataset.maintainer);
    sendParam(checkParam, 'license_title', dataset.license_title);
    sendParam(checkParam, 'state', dataset.state);
    sendParam(checkParam, 'notes', dataset.notes, dataset.description);
    sendParam(checkParam, 'owmner_org', dataset.owmner_org, dataset.organization);

    sendParam(checkArray, 'groups', dataset.groups);
    sendParam(checkArray, 'extras', dataset.extras);
    sendParam(checkArray, 'resources', dataset.resources);
    sendParam(checkArray, 'tags', dataset.tags, dataset.keywords);

    // get when was the metadata last modified
    let metadataLastModified = analyseDate(dataset.metadata_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(dataset.metadata_created);
    }

    let licenseUrlExists = sendParam(checkParam, 'license_url', dataset.license_url);
    if (licenseUrlExists) {
        // if bad URL for license => license = { status, statusText }
        var license = await fetchData(dataset.license_url);
    }

    let urlExists = sendParam(checkParam, 'url', dataset.url);
    if (urlExists) {
        var urlData = await fetchData(dataset.url);
        // if url does not work report it
        if (urlData.error) {
            var urlError = {
                status: urlData.status, // status code of response
                statusText: urlData.statusText // response status text
            }
        }
    }

    let actuallyLastModified = metadataLastModified;
    // analyse all dataset resources
    for (let resource in dataset.resources) {
        let result = await analyseResource(resource);

        resourcesStats.numOfParams += result.numbers.numOfParams;
        resourcesStats.numOfBadParams += result.numbers.numOfBadParams;
        if (result.download.error) {
            resourcesStats.numOfErrors++;
        } else {
            // fill dictionary of formats
            resourcesStats.formats[result.download.format] += 1;
            // if resource was modified after the metadata was already modified
            if (result.lastModified) {
                if (result.lastModified > actuallyLastModified) {
                    actuallyLastModified = result.lastModified;
                }
            }
        }
    }

    return {
        numbers: {
            numOfParams: numOfParams, // total number of parameters
            numOfBadParams: numOfBadParams // number of missing or "empty" parameters
        },
        missingParams: missingParams, // list of missing parameters in dataset metadata
        urlError: urlError, // if URL does not work report it
        metadataLastModified: metadataLastModified, // when was metadata last modified
        actuallyLastModified: actuallyLastModified, // when was dataset actually last modified
        license: license, // if URL for license does not work report it
        resourcesStats: resourcesStats // stats about all dataset resources
    };
}

module.exports = {
    analyseDataset
};