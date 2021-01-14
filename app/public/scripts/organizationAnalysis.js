const {
    analyseParam,
    analyseParamWithOption,
    analyseDate,
    checkParam,
    checkArray
} = require('./analysis.js');

var analyseOrganization = (organization) => {
    numOfParams = 0, numOfBadParams = 0;
    numOfURLs = 0, numOfBadURLs = 0;
    index = 0;
    missingParams = [];

    analyseParam(organization.name, 'name', checkParam);
    analyseParam(organization.id, 'id', checkParam);
    analyseParam(organization.description, 'description', checkParam);
    analyseParam(organization.state, 'state', checkParam);
    analyseParam(organization.approval_status, 'approval_status', checkParam);
    analyseParamWithOption(organization.display_name, organization.title, 'display_name', checkParam);

    analyseParam(organization.packages, 'packages', checkArray);
    analyseParam(organization.extras, 'extras', checkArray);
    analyseParam(organization.users, 'users', checkArray);

    analyseDate(dataset.created);

    // analyseUrl(dataset.image_display_url);

    /*
    for (let dataset in organization.packages) {
        analyseDataset(dataset);
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
    analyseOrganization
};