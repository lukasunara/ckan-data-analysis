const {
    analyseParam,
    analyseParamWithOption,
    checkParam,
    checkArray
} = require('./analysis.js');

var analyseResource = (resource) => {
    numOfParams = 0, numOfBadParams = 0;
    numOfURLs = 0, numOfBadURLs = 0;
    index = 0;
    missingParams = [];

    analyseParam(resource.name, 'name', checkParam);
    analyseParam(resource.id, 'id', checkParam);
    analyseParam(resource.size, 'size', checkParam);
    analyseParam(resource.format, 'format', checkParam);
    analyseParam(resource.state, 'state', checkParam);

    // get when was the metadata last modified
    let metadataLastModified;
    metadataLastModified = analyseDate(dataset.last_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(dataset.created);
    }

    console.log("missingParams: " + missingParams);
    console.log("numOfParams: " + numOfParams);
    console.log("numOfBadParams: " + numOfBadParams);
    console.log("numOfURLs: " + numOfURLs);
    console.log("numOfBadURLs: " + numOfBadURLs);
    console.log();

    return {
        numOfParams: numOfParams,
        numOfBadParams: numOfBadParams,
        numOfURLs: numOfURLs,
        numOfBadURLs: numOfBadURLs
    };
}

module.exports = {
    analyseResource
};