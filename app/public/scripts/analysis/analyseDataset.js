const { fetchData } = require('../utils/fetching.js');
const { createDataset } = require('../create/datasetCreation.js');
const Portal = require('../../../models/data/PortalModel.js');

// method for refreshing data about portals
var analyseDataset = async (portalName, datasetID) => {
    let failed = false;
    let dataset = null;

    let portal = await Portal.fetchPortalByName(portalName);
    if (!portal) {
        failed = true;
    } else {
        let result = await fetchDatasetData(portalName, datasetID);

        if (result.failed) {
            failed = true;
        } else {
            dataset = await createDataset(portalName, result.datasetData);
            await dataset.analyseDataset();
        }
    }
    return { failed: failed, dataset: dataset };
};

// fetch metadata from CKAN
var fetchDatasetData = async (portalName, datasetID) => {
    let failed = false;

    let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasetID;
    let datasetData = await fetchData(datasetUrl);

    if (datasetData.error || datasetData.data === undefined || !datasetData.data.result) {
        failed = true;
    }
    return { failed: failed, datasetData: datasetData.data.result };
}

module.exports = {
    analyseDataset, fetchDatasetData
};