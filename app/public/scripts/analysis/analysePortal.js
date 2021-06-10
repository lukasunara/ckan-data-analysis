const { fetchData } = require('../utils/fetching.js');
const { createPortal } = require('../create/portalCreation.js');

// method for refreshing data about portals
var analysePortal = async (portalName) => {
    let failed = false;

    let datasetsUrl = 'http://' + portalName + '/api/3/action/package_list';
    let datasets = await fetchData(datasetsUrl);

    let organizationsUrl = 'http://' + portalName + '/api/3/action/organization_list';
    let organizations = await fetchData(organizationsUrl);

    let basicInfoUrl = 'http://' + portalName + '/api/3/action/status_show';
    let basicInfo = await fetchData(basicInfoUrl);

    let vocabulariesUrl = 'http://' + portalName + '/api/3/action/vocabulary_list';
    let vocabularies = await fetchData(vocabulariesUrl);

    let portal = null;
    if (datasets.error || datasets.data === undefined || !datasets.data.result ||
        organizations.error || organizations.data === undefined || !organizations.data.result ||
        basicInfo.error || basicInfo.data === undefined || !basicInfo.data.result ||
        vocabularies.error || vocabularies.data === undefined || !vocabularies.data.result
    ) {
        failed = true;
    } else {
        portal = await createPortal(portalName, datasets.data.result,
            organizations.data.result, basicInfo.data.result, vocabularies.data.result
        );
        await portal.analysePortal();
    }
    return { failed: failed, portal: portal };
};

module.exports = {
    analysePortal
};