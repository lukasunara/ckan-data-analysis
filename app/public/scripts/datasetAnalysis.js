const { fetchData } = require('./fetching.js');
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

var analyseDataset = async (dataset) => {
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];

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
    let metadataLastModified;
    metadataLastModified = analyseDate(dataset.metadata_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(dataset.metadata_created);
    }

    // send(dataset.license_url);
    let licenseUrlExists = sendParam(checkParam, 'image_display_url', dataset.license_url);
    if (licenseUrlExists) {
        var license = await fetchData(dataset.license_url);
    }

    // analyseUrl(dataset.url);

    /*
    for (let resource in dataset.resources) {
        analyseResource(dataset.resource);
    }
    */

    return {
        numbers: {
            numOfParams: numOfParams,
            numOfBadParams: numOfBadParams,
            numOfURLs: numOfURLs,
            numOfBadURLs: numOfBadURLs
        },
        missingParams: missingParams,
        lastModified: metadataLastModified,
        license: {
            status: license.status
        }
    };
}

module.exports = {
    analyseDataset
};