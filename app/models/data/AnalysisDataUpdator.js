const { analysePortal } = require('../../public/scripts/analysis/analysePortal');
const { analyseOrganization } = require('../../public/scripts/analysis/analyseOrganization');
const { analyseDataset } = require('../../public/scripts/analysis/analyseDataset');
const { analyseResource } = require('../../public/scripts/analysis/analyseResource');

module.exports = class AnalysisDataUpdator {

    static async updateObjectAnalysis(typeOfObject, portalName, objectID) {
        switch (typeOfObject) {
            case 'portal': await analysePortal(portalName, objectID); break;
            case 'organization': await analyseOrganization(portalName); break;
            case 'dataset': await analyseDataset(portalName, objectID); break;
            case 'resource': await analyseResource(portalName, objectID); break;
            default: console.log('Cannot recognize given type of data: ' + typeOfObject);
        }
    }
};