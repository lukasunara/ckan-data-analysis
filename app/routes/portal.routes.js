const express = require('express');
const router = express.Router({ mergeParams: true });
const { fetchData } = require('../public/scripts/fetching.js');
const { analyseDataset } = require('../public/scripts/datasetAnalysis.js');
const { analyseOrganization } = require('../public/scripts/organizationAnalysis.js');
const { analyseResource } = require('../public/scripts/resourceAnalysis.js');
const { analysePortal } = require('../public/scripts/portalAnalysis.js');

router.get('/', function (req, res) {
    (async () => {
        let datasetsUrl = 'http://' + req.params.portalName + '/api/3/action/package_list';
        let datasets = await fetchData(datasetsUrl);

        let organizationsUrl = 'http://' + req.params.portalName + '/api/3/action/organization_list';
        let organizations = await fetchData(organizationsUrl);

        if (datasets === undefined || organizations == undefined) {
            req.session.error = 'Not found';
            req.session.success = false;
            res.redirect('/portal/' + req.params.portalName);
        } else {
            let results = await analysePortal(portalName);

            res.render('portal', {
                title: "Portal analysis results",
                portalName: req.params.portalName,
                datasets: datasets,
                organizations: organizations,
                results: results
            });
        }
    })();
});

router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        let datasetUrl = 'http://' + req.params.portalName + '/api/3/action/package_show?id='
            + req.params.datasetID;

        let dataset = await fetchData(datasetUrl);

        if (dataset === undefined) {
            req.session.error = 'Not found';
            req.session.success = false;
            res.redirect('/portal/' + req.params.portalName);
        } else {
            let results = await analyseDataset(dataset.data.result);

            console.log(results);

            res.render('dataset', {
                title: "Dataset analysis results",
                dataset: dataset.data.result,
                portalName: req.params.portalName,
                results: results
            });
        }
    })();
});

router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        let organizationUrl = 'http://' + req.params.portalName + '/api/3/action/organization_show?id='
            + req.params.organizationID;

        let organization = await fetchData(organizationUrl);

        if (organization === undefined) {
            req.session.error = 'Not found';
            req.session.success = false;
            res.redirect('/portal/' + req.params.portalName);
        } else {
            let results = await analyseOrganization(organization.data.result);

            console.log(results);

            res.render('organization', {
                title: "Organization analysis results",
                portalName: req.params.portalName,
                organization: organization.data.result,
                results: results
            });
        }
    })();
});

router.get('/resource/:resourceID', async (req, res) => {
    let resourceUrl = 'http://' + req.params.portalName + '/api/3/action/resource_show?id='
        + req.params.resourceID;

    let resource = await fetchData(resourceUrl);

    if (resource === undefined) {
        req.session.error = 'Not found';
        req.session.success = false;
        res.redirect('/portal/' + req.params.portalName);
    } else {
        let results = await analyseResource(resource.data.result);

        console.log(results);

        res.render('resource', {
            title: "Resource analysis results",
            resource: resource.data.result,
            results: results
        });
    }
});

module.exports = router;