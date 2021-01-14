const {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
} = require('./analysis.js');

var analyseDataset = (dataset) => {
    numOfParams = 0, numOfBadParams = 0;
    numOfURLs = 0, numOfBadURLs = 0;
    index = 0;
    missingParams = [];

    analyseParam(dataset.title, 'title', checkParam);
    analyseParam(dataset.name, 'name', checkParam);
    analyseParam(dataset.id, 'id', checkParam);
    analyseParam(dataset.author, 'author', checkParam);
    analyseParam(dataset.maintainer, 'maintainer', checkParam);
    analyseParam(dataset.license_title, 'license_title', checkParam);
    analyseParam(dataset.state, 'state', checkParam);
    analyseParamWithOption(dataset.notes, dataset.description, 'notes', checkParam);
    analyseParamWithOption(dataset.owmner_org, dataset.organization, 'owmner_org', checkParam);

    analyseParam(dataset.groups, 'groups', checkArray);
    analyseParam(dataset.extras, 'extras', checkArray);
    analyseParam(dataset.resources, 'resources', checkArray);
    analyseParamWithOption(dataset.tags, dataset.keywords, 'tags', checkArray);

    // get when was the metadata last modified
    let metadataLastModified;
    metadataLastModified = analyseDate(dataset.metadata_modified);
    if (metadataLastModified < 0) {
        metadataLastModified = analyseDate(dataset.metadata_created);
    }

    // analyseUrl(dataset.license_url);
    // analyseUrl(dataset.url);

    /*
    for (let resource in dataset.resources) {
        analyseResource(dataset.resource);
    }
    */

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
    analyseDataset
};