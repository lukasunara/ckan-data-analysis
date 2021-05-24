const Portal = require('../../../models/data/PortalModel.js');
const { fetchData } = require('../utils/fetching.js');
const { createPortal } = require('../create/portalCreation.js');

// method for refreshing data about portals
var analysePortal = async (portalName) => {
    let failed = false;
    // if portalName is undefined => analyse all portals from database
    if (!portalName) {
        let portals = await Portal.fetchAllPortalsFromDB();
        for (let portalID of portals) {
            failed = startAnalysingPortal(portalID);
        }
    } else {
        failed = startAnalysingPortal(portalName);
    }
    return failed;
};

// start analysing portal
var startAnalysingPortal = async (portalName) => {
    let failed = false;

    let datasetsUrl = 'http://' + portalName + '/api/3/action/package_list';
    let datasets = await fetchData(datasetsUrl);

    let organizationsUrl = 'http://' + portalName + '/api/3/action/organization_list';
    let organizations = await fetchData(organizationsUrl);

    let basicInfoUrl = 'http://' + portalName + '/api/3/action/status_show';
    let basicInfo = await fetchData(basicInfoUrl);

    let vocabulariesUrl = 'http://' + portalName + '/api/3/action/vocabulary_list';
    let vocabularies = await fetchData(vocabulariesUrl);

    if (datasets.error || datasets.data === undefined ||
        organizations.error || organizations.data === undefined ||
        basicInfo.error || basicInfo.data === undefined ||
        vocabularies.error || vocabularies.data === undefined
    ) {
        failed = true;
    } else {
        let portal = await createPortal(portalName, datasets.data.result,
            organizations.data.result, basicInfo.data.result, vocabularies.data.result
        );
        await portal.analysePortal();
    }
    return failed;
}

module.exports = {
    analysePortal
};