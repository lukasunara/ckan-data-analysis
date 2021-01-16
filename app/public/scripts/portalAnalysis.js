const { fetchData } = require('./fetching.js');
const { analyseDataset } = require('./datasetAnalysis.js');
const { analyseOrganization } = require('./organizationAnalysis.js');

var datasetsNumOfParams, datasetsNumOfBadParams;
var organizationsNumOfParams, organizationsNumOfBadParams;

var analysePortal = async (portalName, datasets, organizations) => {
    datasetsNumOfParams = 0;
    datasetsNumOfBadParams = 0;
    organizationsNumOfParams = 0;
    organizationsNumOfBadParams = 0;

    for (let i = 0; i < datasets.length; i++) {
        let datasetUrl = 'http://' + portalName
            + '/api/3/action/package_show?id=' + datasets[i];

        let dataset = await fetchData(datasetUrl);

        if (dataset === undefined) {
            req.session.error = 'Not found';
            req.session.success = false;
            res.redirect('/portal/' + req.params.portalName);
        } else {
            var results = analyseDataset(dataset.result);

            datasetsNumOfParams += results.numOfParams;
            datasetsNumOfBadParams += results.numOfBadParams;
        }
    }

    for (let i = 0; i < organizations.length; i++) {
        let organizationUrl = 'http://' + portalName
            + '/api/3/action/organization_show?id=' + organizations[i];

        let organization = await fetchData(organizationUrl);

        if (organization === undefined) {
            req.session.error = 'Not found';
            req.session.success = false;
            res.redirect('/portal/' + portalName);
        } else {
            var results = analyseOrganization(organization.result);

            organizationsNumOfParams += results.numOfParams;
            organizationsNumOfBadParams += results.numOfBadParams;
        }
    }

    return {
        numbers: {
            datasetNumOfParams: datasetsNumOfParams,
            datasetNumOfBadParams: datasetsNumOfBadParams,
            organizationsNumOfParams: organizationsNumOfParams,
            organizationsNumOfBadParams: organizationsNumOfBadParams
        }
    }
}

module.exports = {
    analysePortal
};