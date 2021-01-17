const { fetchData } = require('./fetching.js');
const {
    analyseParam,
    analyseParamWithOption,
    checkParam,
    checkArray
} = require('./analysis.js');

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

var analyseOrganization = async (organization) => {
    numOfParams = 0;
    numOfBadParams = 0;
    index = 0;
    missingParams = [];

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
        if (blobImage.message) {
            var imageDisplayURL = {
                error: true,
                message: urlData.message
            }
        } else {
            if (blobImage.data == 'extension' || blobImage.data.status) {
                console.log(blobImage); // if error
            } else {
                var imageDisplayURL = organization.image_display_url;
            }
        }
    }

    /*
    if(packagesExist) {
        for (let dataset in organization.packages) {
            analyseDataset(dataset);
        }
    }
    */

    return {
        numbers: {
            numOfParams: numOfParams,
            numOfBadParams: numOfBadParams
        },
        missingParams: missingParams,
        imageDisplayURL: imageDisplayURL,
        createdDate: createdDate
    };
}

module.exports = {
    analyseOrganization
};