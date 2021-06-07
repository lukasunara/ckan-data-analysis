const { fetchData } = require('../utils/fetching.js');
const { createDataset } = require('./datasetCreation.js');
const { createOrganization } = require('./organizationCreation.js');
const Portal = require('../../../models/data/PortalModel.js');

// creates new Portal object (or fetches existing one from database)
var createPortal = async (portalName, datasets, organizations, basicInfo, vocabularies) => {
    // fetch organization from database (if exists)
    let newPortal = await Portal.fetchPortalByName(portalName);

    let dcatOrRdf = false; //can portal support linked open data like RDF
    let extensions = new Set(basicInfo.extensions);
    if (extensions.has('dcat') || extensions.has('rdft')) {
        dcatOrRdf = true;
    }
    let currentDate = new Date();

    // if portal doesn't exists in database create a new one
    if (!newPortal) {
        let data = {
            object_id: portalName, changed: true, last_updated: currentDate, name: portalName,
            title: basicInfo.site_title, description: basicInfo.site_description,
            num_of_vocabularies: vocabularies.length, num_of_extensions: extensions.size,
            dcat_or_rdf: dcatOrRdf, url: basicInfo.site_url
        }
        newPortal = new Portal(data);
        await newPortal.persist();
    } else {
        // if exists in database => check if it has passed 7 days since last update
        // let sevenDays = 7 * 24 * 60 * 60 * 1000; //7 days in miliseconds
        // if (currentDate - newPortal.last_updated >= sevenDays) {
        // update data about organization
        let dataForUpdate = {
            last_updated: currentDate, name: portalName, title: basicInfo.site_title,
            description: basicInfo.site_description, num_of_vocabularies: vocabularies.length,
            num_of_extensions: extensions.size, dcat_or_rdf: dcatOrRdf, url: basicInfo.site_url
        }
        await newPortal.update(dataForUpdate);
        // }
    }
    for (let i = 0; i < organizations.length; i++) {
        let organizationUrl = 'http://' + portalName + '/api/3/action/organization_show?id=' + organizations[i];
        let organization = await fetchData(organizationUrl);

        if (organization.error || organization.data === undefined || !organization.data.result) {
            continue;
        } else {
            await createOrganization(portalName, organization.data.result);
        }
    }
    for (let i = 0; i < datasets.length; i++) {
        let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasets[i];
        let dataset = await fetchData(datasetUrl);

        if (dataset.error || dataset.data === undefined || !dataset.data.result) {
            continue;
        } else {
            await createDataset(portalName, dataset.data.result);
        }
    }
    return newPortal;
};

module.exports = {
    createPortal
};