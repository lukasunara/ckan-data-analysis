const { fetchData } = require('../utils/fetching.js');
const { createOrganization } = require('../create/organizationCreation.js');

// method for refreshing data about portals
var analyseOrganization = async (portalName, organizationID) => {
    let failed = false;

    let result = await fetchOrganizationData(portalName, organizationID);

    if (result.failed) {
        failed = true;
    } else {
        let organization = await createOrganization(portalName, result.organizationData.data.result);
        await organization.analyseOrganization();
    }
    return failed;
};

// fetch metadata from CKAN
var fetchOrganizationData = async (portalName, organizationID) => {
    let failed = false;

    let organizationUrl = 'http://' + portalName + '/api/3/action/organization_show?id=' + organizationID;
    let organizationData = await fetchData(organizationUrl);

    if (organizationData.error || organizationData.data === undefined) {
        failed = true;
    }
    return { failed: failed, organizationData: organizationData };
}

module.exports = {
    analyseOrganization, fetchOrganizationData
};