const { fetchData } = require('../utils/fetching.js');
const { createResource } = require('../create/resourceCreation.js');

// method for refreshing data about resources
var analyseResource = async (portalName, resourceID) => {
    let failed = false;

    let result = await fetchResourceData(portalName, resourceID);

    if (result.failed) {
        failed = true;
    } else {
        let resource = await createResource(resourceData.data.result);
        await resource.analyseResource();
    }
    return failed;
};

// fetch metadata from CKAN
var fetchResourceData = async (portalName, resourceID) => {
    let failed = false;

    let resourceUrl = 'http://' + portalName + '/api/3/action/resource_show?id=' + resourceID;
    let resourceData = await fetchData(resourceUrl);

    if (resourceData.error || resourceData.data === undefined) {
        failed = true;
    }
    return { failed: failed, resourceData: resourceData };
}

module.exports = {
    analyseResource, fetchResourceData
};