const express = require('express');
const router = express.Router({ mergeParams: true });
const { fetchData, redirectToWithError } = require('../public/scripts/fetching.js');

const { createDataset } = require('../public/scripts/datasetAnalysis.js');
const { createOrganization } = require('../public/scripts/organizationAnalysis.js');
const { createResource } = require('../public/scripts/resourceAnalysis.js');
const { createPortal } = require('../public/scripts/portalAnalysis.js');

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

            let basicInfoUrl = 'http://' + portalName + '/api/3/action/status_show';
            let basicInfo = await fetchData(basicInfoUrl);

            let vocabulariesUrl = 'http://' + portalName + '/api/3/action/vocabulary_list';
            let vocabularies = await fetchData(vocabulariesUrl);

            if (datasets.error || datasets.data === undefined ||
                organizations.error || organizations.data === undefined ||
                basicInfo.error || basicInfo.data === undefined ||
                vocabularies.error || vocabularies.data === undefined
            ) {
                redirectToWithError(res, req, '/menu');
            } else {
                let portal = await createPortal(portalName, datasets.data.result,
                    organizations.data.result, basicInfo.data.result, vocabularies.data.result
                );
                await portal.analysePortal(true);

                res.render('portal', {
                    title: "Portal analysis results",
                    portalName: portalName,
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
            let datasetData = await fetchData(datasetUrl);

            if (datasetData.error || datasetData.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let dataset = await createDataset(portalName, datasetData.data.result, true);
                dataset.analyseDataset(dataset.changed);

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
            let organizationData = await fetchData(organizationUrl);

            if (organizationData.error || organizationData.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let organization = await createOrganization(portalName, organizationData.data.result);
                await organization.analyseOrganization();

                res.render('organization', {
                    title: "Organization analysis results",
                    portalName: portalName,
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
            let resourceData = await fetchData(resourceUrl);

            if (resourceData.error || resourceData.data === undefined) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let resource = await createResource(resourceData.data.result);
                resource.analyseResource(resource.changed);

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