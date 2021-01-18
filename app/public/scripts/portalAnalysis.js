const { fetchData, redirectToWithError } = require('./fetching.js');
const { analyseDataset } = require('./datasetAnalysis.js');
const { analyseOrganization } = require('./organizationAnalysis.js');

var analysePortal = async (portalName, datasets, organizations) => {
    var datasetsStats = {
        numOfParams: 0,
        numOfBadParams: 0,
        numOfErrors: 0,
        differentModifiedDates: 0
    };
    var organizationsStats = {
        numOfParams: 0,
        numOfBadParams: 0,
        numOfErrors: 0
    };

    for (let i = 0; i < datasets.length; i++) {
        let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasets[i];

        let dataset = await fetchData(datasetUrl);

        if (dataset.error) {
            datasetsStats.differentModifiedDates++;
        } else {
            var result = await analyseDataset(portalName, dataset.data.result, false);

            datasetsStats.numOfParams += result.numbers.numOfParams;
            datasetsStats.numOfBadParams += result.numbers.numOfBadParams;
            if (result.urlError) {
                datasetsStats.numOfErrors++;
            }
            if (result.resourcesStats) {
                datasetsStats.numOfErrors += result.resourcesStats.numOfErrors;
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
            organizationsStats.numOfErrors++;
        } else {
            var result = await analyseOrganization(portalName, organization.data.result, false);

            organizationsStats.numOfParams += result.numbers.numOfParams;
            organizationsStats.numOfBadParams += result.numbers.numOfBadParams;
            if (result.imageDisplayURL && result.imageDisplayURL.error) {
                organizationsStats.numOfErrors++;
            }
        }
    }


    return {
        datasetsStats
        // organizationsStats
    }
}

module.exports = {
    analysePortal
};