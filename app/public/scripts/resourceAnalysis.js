const { fetchData } = require('./fetching.js');
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

    let urlExists = sendParam(checkParam, 'url', resource.url);
    if (urlExists) {
        var urlData = await fetchData(resource.url);
    }

    return {
        numbers: {
            numOfParams: numOfParams,
            numOfBadParams: numOfBadParams,
            numOfURLs: numOfURLs,
            numOfBadURLs: numOfBadURLs
        },
        missingParams: missingParams,
        lastModified: metadataLastModified,
        download: {
            format: urlData.extension,
            status: urlData.status
        }
    }
}

module.exports = {
    analyseResource
};