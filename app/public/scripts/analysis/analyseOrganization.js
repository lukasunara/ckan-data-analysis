const { fetchData } = require('../utils/fetching.js');
const { createOrganization } = require('../create/organizationCreation.js');
const { fetchPortalByName } = require('../../../models/data/PortalModel.js');

// method for refreshing data about portals
var analyseOrganization = async (portalName, organizationID) => {
    let failed = false;
    let organization = null;

    let portal = await fetchPortalByName(portalName);
    if (!portal) {
        failed = true;
    } else {
        let result = await fetchOrganizationData(portalName, organizationID);

        if (result.failed) {
            failed = true;
        } else {
            organization = await createOrganization(portalName, result.organizationData);
            await organization.analyseOrganization();
        }
    }
    return { failed: failed, organization: organization };
};

// fetch metadata from CKAN
var fetchOrganizationData = async (portalName, organizationID) => {
    let failed = false;

    let organizationUrl = 'http://' + portalName + '/api/3/action/organization_show?id=' + organizationID;
    let organizationData = await fetchData(organizationUrl);

    if (organizationData.error || organizationData.data === undefined) {
        failed = true;
    }
    return { failed: failed, organizationData: organizationData.data.result };
}

module.exports = {
    analyseOrganization, fetchOrganizationData
};