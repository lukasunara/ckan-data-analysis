const { fetchData, redirectToWithError } = require('./fetching.js');
const { analyseDataset } = require('./datasetAnalysis.js');
const { analyseOrganization } = require('./organizationAnalysis.js');

var datasetsStats = {
    numOfParams,
    numOfBadParams,
    numOfErrors,
    differentModifiedDates
};
var organizationsStats = {
    numOfParams,
    numOfBadParams,
    numOfErrors
};

var analysePortal = async (res, req, portalName, datasets, organizations) => {
    datasetsStats.numOfParams = 0; organizationsStats.numOfParams = 0;
    datasetsStats.numOfBadParams = 0; organizationsStats.numOfBadParams = 0;
    datasetsStats.numOfErrors = 0; organizationsStats.numOfErrors = 0;
    datasetsStats.differentModifiedDates = 0;

    for (let i = 0; i < datasets.length; i++) {
        let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasets[i];

        let dataset = await fetchData(datasetUrl);

        if (dataset.error) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            var result = await analyseDataset(dataset.data.result);

            datasetsStats.numOfParams += result.numbers.numOfParams;
            datasetsStats.numOfBadParams += result.numbers.numOfBadParams;
            if (result.urlError) {
                datasetsStats.numOfErrors++;
            }
            if (result.license.error) {
                datasetsStats.numOfErrors++;
            }
            if (result.metadataLastModified !== result.actuallyLastModified) {
                datasetsStats.differentModifiedDates++;
            }
        }
    }

    for (let i = 0; i < organizations.length; i++) {
        let organizationUrl = 'http://' + portalName
            + '/api/3/action/organization_show?id=' + organizations[i];

        let organization = await fetchData(organizationUrl);

        if (organization.error) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            var result = await analyseOrganization(organization.data.result);

            organizationsStats.numOfParams += result.numbers.numOfParams;
            organizationsStats.numOfBadParams += result.numbers.numOfBadParams;
            if (result.imageDisplayURL.error) {
                organizationsStats.numOfErrors++;
            }
        }
    }

    return {
        datasetsStats,
        organizationsStats
    }
}

module.exports = {
    analysePortal
};