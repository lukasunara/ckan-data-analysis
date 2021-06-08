const express = require('express');
const router = express.Router({ mergeParams: true });

const { analysePortal } = require('../public/scripts/analysis/analysePortal.js');
const { analyseOrganization } = require('../public/scripts/analysis/analyseOrganization.js');
const { analyseDataset } = require('../public/scripts/analysis/analyseDataset.js');
const { analyseResource } = require('../public/scripts/analysis/analyseResource.js');

// '/update/portal/:portalName'
router.get('/', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];

        if (portalName) await analysePortal(portalName);

        res.redirect('/portal/' + req.params.portalName);
    })();
});

// '/update/portal/:portalName/organization/:organizationID'
router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var organizationID = req.params.organizationID;

        if (organizationID) await analyseOrganization(portalName, organizationID);

        res.redirect('/portal/' + req.params.portalName + '/organization/' + organizationID);
    })();
});

// '/update/portal/:portalName/dataset/:datasetID'
router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var datasetID = req.params.datasetID;

        if (datasetID) await analyseDataset(portalName, datasetID);

        res.redirect('/portal/' + req.params.portalName + '/dataset/' + datasetID);
    })();
});
// '/update/portal/:portalName/resource/:resourceID'
router.get('/resource/:resourceID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var resourceID = req.params.resourceID;

        if (resourceID) await analyseResource(portalName, resourceID);

        res.redirect('/portal/' + req.params.portalName + '/resource/' + resourceID);
    })();
});

module.exports = router;