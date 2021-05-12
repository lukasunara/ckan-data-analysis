const { fetchData } = require('./fetching.js');
const { analyseDataset, createDataset } = require('./datasetAnalysis.js');
const {
    analyseParam,
    analyseParamWithOption,
    checkParam,
    checkArray
} = require('./analysis.js');
const Organization = require('../../models/data/OrganizationModel.js');

var numOfParams, numOfBadParams;
var index;
var missingParams = [];

// sends param to a check function 
var sendParam = (checkFunction, key, param1, param2) => {
    numOfParams++;

    var exists;
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

var analyseOrganization = async (portalName, organization, checkDatasets) => {
    /*
    1. provjeri parametre
    2. ocijeni sve datasetove
    3. spremi u bazu podataka info o organizaciji i svim chartovima
    */
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];
    var datasetsStats = {
        numOfParams: 0,
        numOfBadParams: 0,
        numOfErrors: 0,
        differentModifiedDates: 0
    };

    sendParam(checkParam, 'name', organization.name);
    sendParam(checkParam, 'id', organization.id);
    sendParam(checkParam, 'description', organization.description);
    sendParam(checkParam, 'state', organization.state);
    sendParam(checkParam, 'approval_status', organization.approval_status);
    sendParam(checkParam, 'display_name', organization.display_name, organization.title);

    let packagesExist = sendParam(checkArray, 'packages', organization.packages);
    sendParam(checkArray, 'extras', organization.extras);
    sendParam(checkArray, 'users', organization.users);

    let dateExists = sendParam(checkParam, 'created', organization.created);
    if (dateExists) {
        var createdDate = new Date(organization.created).toLocaleString();
    }

    let urlExists = sendParam(checkParam, 'image_display_url', organization.image_display_url);
    if (urlExists) {
        let blobImage = await fetchData(organization.image_display_url);
        if (blobImage.error) {
            var imageDisplayURL = {
                error: true, // there was an error
                status: urlData.status, // status code of error
                statusText: urlData.statusText // error status text
            }
        } else {
            if (blobImage.data == 'extension') { // if error
                console.log('URL does not lead to a image: ' + blobImage);
            } else {
                var imageDisplayURL = organization.image_display_url;
            }
        }
    }
    if (checkDatasets) {
        // analyse all datasets
        if (packagesExist) {
            for (let i = 0; i < organization.packages.length; i++) {
                let datasetUrl = 'http://' + portalName
                    + '/api/3/action/package_show?id=' + organization.packages[i].id;

                let datasetData = await fetchData(datasetUrl);

                if (datasetData.error) {
                    datasetsStats.numOfErrors++;
                } else {
                    let result = await analyseDataset(portalName, datasetData.data.result, true);

                    datasetsStats.numOfParams += result.numbers.numOfParams;
                    datasetsStats.numOfBadParams += result.numbers.numOfBadParams;
                    if (result.urlError) {
                        datasetsStats.numOfErrors++;
                    }
                    if (result.license.error) {
                        datasetsStats.numOfErrors++;
                    }
                    if (result.dateLastModified !== result.actuallyLastModified) {
                        datasetsStats.differentModifiedDates++;
                    }
                }
            }
        }
    }

    return {
        numbers: {
            numOfParams: numOfParams, // total number of parameters
            numOfBadParams: numOfBadParams // number of missing or "empty" parameters
        },
        missingParams: missingParams, // list of missing parameters in organization metadata
        imageDisplayURL: imageDisplayURL, // image_display_url or undefined if error or missing
        createdDate: createdDate, // organization created date
        datasetsStats: datasetsStats // stats about datasets
    };
}

var createOrganization = async (portalName, organization) => {
    let changed = false;
    // fetch organization from database (if exists)
    let newOrganization = Organization.fetchOrganizationById(organization.id, portalName);
    if (!newOrganization) {
        let title = dataset.title ? dataset.title : dataset.display_name;

        newOrganization = new Organization(organization.id, portalName, organization.name,
            title, organization.description, organization.state, organization.approval_status,
            organization.extras.length, organization.users.length, organization.created,
            organization.image_display_url
        );
        changed = true;
    } else {
        // update data about organization (don't know when because there is not a last_modified flag)
    }
    if (organization.packages) {
        for (let i = 0; i < organization.packages.length; i++) {
            let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + organization.packages[i];
            let dataset = await fetchData(datasetUrl);

            if (dataset.error) {
                continue;
            } else {
                await createDataset(portalName, dataset.data.result);
            }
        }
    }
    return { newOrganization: newOrganization, changed: changed };
};

module.exports = {
    analyseOrganization, createOrganization
};