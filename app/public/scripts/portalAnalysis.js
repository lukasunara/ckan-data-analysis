const { fetchData } = require('./fetching.js');
const { analyseDataset } = require('./datasetAnalysis.js');
const { analyseOrganization } = require('./organizationAnalysis.js');
const Portal = require('../../models/data/PortalModel.js');

var createPortal = async (portalName, datasets, organizations, basicInfo, vocabularies) => {
    let portal = Portal.fetchPortalByName(portalName);
    if (!portal) {
        let dcatOrRdf = false;
        let extensions = new Set(basicInfo.extensions);
        if (extensions.has('dcat') || extensions.has('rdft')) {
            dcatOrRdf = true;
        }

        portal = new Portal(portalName, portalName, basicInfo.site_title, basicInfo.site_description,
            vocabularies.length, basicInfo.extensions.length, dcatOrRdf, basicInfo.url
        );
    }
    for (let i = 0; i < datasets.length; i++) {
        let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasets[i];
        let dataset = await fetchData(datasetUrl);

        if (dataset.error) {
            continue;
        } else {
            await createDataset(portalName, dataset.data.result);
        }
    }
    for (let i = 0; i < organizations.length; i++) {
        let organizationUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + organizations[i];
        let organization = await fetchData(organizationUrl);

        if (organization.error) {
            continue;
        } else {
            await createOrganization(portalName, organization.data.result);
        }
    }
    return portal;
};

var analysePortal = async (portalName, datasets, organizations) => {
    /*
    1. portal_id = name (tj. object_id = name)
    2. provjeri title, description, url
    3. ocijeni sve organizacije
    4. spremi u bazu podataka info o portalu i svim chartovima
    */
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
    analysePortal,
    createPortal
};