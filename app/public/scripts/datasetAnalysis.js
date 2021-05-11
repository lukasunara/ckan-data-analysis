const { fetchData } = require('./fetching.js');
const { analyseResource } = require('./resourceAnalysis.js');
const {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
} = require('./analysis.js');
const Dataset = require('../../models/data/DatasetModel.js');

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

// analyse one dataset
var analyseDataset = async (portalName, dataset, checkResources) => {
    /*
    1. provjeri parametre
    2. ocijeni sve resurse
    3. spremi u bazu podataka info o datasetu i svim chartovima
    */
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];
    var resourcesStats = {
        numOfParams: 0,
        numOfBadParams: 0,
        formats: {},
        numOfErrors: 0
    };

    sendParam(checkParam, 'title', dataset.title);
    sendParam(checkParam, 'name', dataset.name);
    sendParam(checkParam, 'id', dataset.id);
    sendParam(checkParam, 'author', dataset.author);
    sendParam(checkParam, 'maintainer', dataset.maintainer);
    sendParam(checkParam, 'license_title', dataset.license_title);
    sendParam(checkParam, 'state', dataset.state);
    sendParam(checkParam, 'metadata_created', dataset.metadata_created);
    sendParam(checkParam, 'metadata_modified', dataset.metadata_modified);
    sendParam(checkParam, 'notes', dataset.notes, dataset.description);
    sendParam(checkParam, 'owmner_org', dataset.owmner_org, dataset.organization);

    sendParam(checkArray, 'groups', dataset.groups);
    sendParam(checkArray, 'extras', dataset.extras);
    sendParam(checkArray, 'resources', dataset.resources);
    sendParam(checkArray, 'tags', dataset.tags, dataset.keywords);

    // get when was the metadata last modified
    let metadataLastModified = analyseDate(dataset.metadata_modified);
    if (metadataLastModified < 0) {
        var dateLastModified = new Date(dataset.metadata_created);
        metadataLastModified = analyseDate(dataset.metadata_created);
    } else {
        var dateLastModified = new Date(dataset.metadata_modified);
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

    if (checkResources) {
        var actuallyLastModified = dateLastModified;
        // analyse all dataset resources
        for (let i = 0; i < dataset.resources.length; i++) {
            let resourceUrl = 'http://' + portalName
                + '/api/3/action/resource_show?id=' + dataset.resources[i].id;

            let resourceData = await fetchData(resourceUrl);

            if (resourceData.error) {
                resourcesStats.numOfErrors++;
            } else {
                let result = await analyseResource(resourceData.data.result);

                resourcesStats.numOfParams += result.numbers.numOfParams;
                resourcesStats.numOfBadParams += result.numbers.numOfBadParams;
                if (result.download) {
                    if (result.download.error) {
                        resourcesStats.numOfErrors++;
                    } else {
                        // fill dictionary of formats
                        if (!resourcesStats.formats[result.download.format]) {
                            resourcesStats.formats[result.download.format] = 1;
                        } else {
                            resourcesStats.formats[result.download.format]++;
                        }
                        // if resource was modified after the metadata was already modified
                        if (result.dates.lastModified) {
                            if (result.dates.lastModified > actuallyLastModified) {
                                actuallyLastModified = result.dates.lastModified;
                            }
                        }
                    }
                }
            }
        }
    }
    let actuallyLastModifiedMonths = analyseDate(actuallyLastModified);

    return {
        numbers: {
            numOfParams: numOfParams, // total number of parameters
            numOfBadParams: numOfBadParams // number of missing or "empty" parameters
        },
        missingParams: missingParams, // list of missing parameters in dataset metadata
        urlError: urlError, // if URL does not work report it
        dates: {
            metadataLastModifiedMonths: metadataLastModified, // when was metadata last modified
            dateLastModified: dateLastModified ? dateLastModified.toLocaleString() : '', // actual date
            actuallyLastModified: actuallyLastModified ? actuallyLastModified.toLocaleString() : '', // when was dataset actually last modified
            actuallyLastModifiedMonths: actuallyLastModifiedMonths
        },
        license: license, // if URL for license does not work report it
        resourcesStats: resourcesStats // stats about all dataset resources
    };
}

var createDataset = async (portalName, dataset) => {
    let checkResources = false;

    let newDataset = Dataset.fetchDatasetById(dataset.id, portalName);
    if (!newDataset) {
        let orgID = dataset.owner_org ? dataset.owmner_org : dataset.organization.id;
        let description = dataset.notes ? dataset.notes : dataset.description;
        let metadataCreated = new Date(dataset.metadata_created);
        let metadataModified = new Date(dataset.metadata_modified);
        let numOfKeywords = dataset.tags ? dataset.tags.length : (dataset.keywords ? dataset.keywords.length : 0);

        newDataset = new Dataset(dataset.id, portalName, dataset.owner_org, orgID,
            dataset.name, dataset.title, dataset.owner_org, dataset.author, dataset.maintainer,
            dataset.private, dataset.state, description, metadataCreated, metadataModified,
            dataset.extras.length, dataset.groups.length, numOfKeywords, dataset.license_title,
            dataset.license_url, dataset.url
        );
        checkResources = true;
    } else {
        let lastModified = new Date(dataset.metadata_modified);
        let savedLastModified = new Date(newDataset.metadataLastModified);
        // if last modified timestamps are almost equal continue, else update
        if (lastModified && (lastModified - savedLastModified >= 45)) {
            let numOfKeywords = dataset.tags ? dataset.tags.length : (dataset.keywords ? dataset.keywords.length : 0);

            await newDataset.updateDatasetData(lastModified, dataset.extras.length,
                dataset.groups.length, numOfKeywords, dataset.license_title, dataset.license_url, dataset.url
            );
            checkResources = true;
        }
    }
    if (checkResources) {
        for (let i = 0; i < dataset.resources.length; i++) {
            let resourceUrl = 'http://' + portalName
                + '/api/3/action/resource_show?id=' + dataset.resources[i].id;
            let resourceData = await fetchData(resourceUrl);

            if (resourceData.error) {
                resourcesStats.numOfErrors++;
            } else {
                await createResource(portalName, resourceData.data.result, dataset.id);
            }
        }
    }
    newDataset.changed = checkResources;
    return newDataset;
};

module.exports = {
    analyseDataset, createDataset
};