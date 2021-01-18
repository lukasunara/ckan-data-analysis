const express = require('express');
const router = express.Router({ mergeParams: true });
const { fetchData, redirectToWithError } = require('../public/scripts/fetching.js');
const { analyseDataset } = require('../public/scripts/datasetAnalysis.js');
const { analyseOrganization } = require('../public/scripts/organizationAnalysis.js');
const { analyseResource } = require('../public/scripts/resourceAnalysis.js');
const { analysePortal } = require('../public/scripts/portalAnalysis.js');

// get '/portal/:portalName
router.get('/', function (req, res) {
    (async () => {
        var portalName = req.params.portalName;

        if (!portalName) {
            redirectToWithError(res, req, '/menu');
        } else {
            let datasetsUrl = 'http://' + portalName + '/api/3/action/package_list';
            let datasets = await fetchData(datasetsUrl);

            let organizationsUrl = 'http://' + portalName + '/api/3/action/organization_list';
            let organizations = await fetchData(organizationsUrl);

            if (datasets.error || datasets.data === undefined ||
                organizations.error || organizations.data === undefined
            ) {
                redirectToWithError(res, req, '/menu');
            } else {
                let results = await analysePortal(
                    res, req, portalName, datasets.data.result, organizations.data.result
                );

                res.render('portal', {
                    title: "Portal analysis results",
                    portalName: req.params.portalName,
                    datasets: datasets.data.result,
                    organizations: organizations.data.result,
                    results: results
                });
            }
        }
    })();
});

// get '/portal/:portalName/dataset/:datasetID
router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        var portalName = req.params.portalName;
        var datasetID = req.params.datasetID;

        if (!datasetID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let datasetUrl = 'http://' + portalName + '/api/3/action/package_show?id=' + datasetID;

            let dataset = await fetchData(datasetUrl);

            if (dataset.error || dataset.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
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
        }
    })();
});

// get '/portal/:portalName/organization/:organizationID
router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        var portalName = req.params.portalName;
        var organizationID = req.params.organizationID;

        if (!organizationID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let organizationUrl = 'http://' + portalName
                + '/api/3/action/organization_show?id=' + organizationID;

            let organization = await fetchData(organizationUrl);

            if (organization.error || organization.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let results = await analyseOrganization(organization.data.result);

                res.render('organization', {
                    title: "Organization analysis results",
                    portalName: req.params.portalName,
                    organization: organization.data.result,
                    results: results
                });
            }
        }
    })();
});

// get '/portal/:portalName/resource/:resourceID
router.get('/resource/:resourceID', function (req, res) {
    (async () => {
        var portalName = req.params.portalName;
        var resourceID = req.params.resourceID;

        if (!resourceID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let resourceUrl = 'http://' + portalName + '/api/3/action/resource_show?id=' + resourceID;

            let resource = await fetchData(resourceUrl);

            if (resource.error || resource.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let results = await analyseResource(resource.data.result);

                res.render('resource', {
                    title: "Resource analysis results",
                    resource: resource.data.result,
                    results: results
                });
            }
        }
    })();
});

module.exports = router;