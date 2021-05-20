const express = require('express');
const router = express.Router({ mergeParams: true });
const { fetchData, redirectToWithError } = require('../public/scripts/utils/fetching.js');
const { createDataset } = require('../public/scripts/create/datasetCreation.js');
const { createOrganization } = require('../public/scripts/create/organizationCreation.js');
const { createResource } = require('../public/scripts/create/resourceCreation.js');
const { createPortal } = require('../public/scripts/create/portalCreation.js');

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
                await portal.analysePortal();

                res.render('portal', {
                    linkActive: 'menu',
                    title: "Portal analysis results",
                    portalName: portalName,
                    datasets: datasets.data.result,
                    organizations: organizations.data.result,
                    objectData: portal
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
                let dataset = await createDataset(portalName, datasetData.data.result);
                dataset.analyseDataset();

                res.render('dataset', {
                    linkActive: 'menu',
                    title: "Dataset analysis results",
                    portalName: portalName,
                    objectData: dataset
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
                    linkActive: 'menu',
                    title: "Organization analysis results",
                    portalName: portalName,
                    objectData: organization
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
                resource.analyseResource();

                res.render('resource', {
                    linkActive: 'menu',
                    title: "Resource analysis results",
                    objectData: resource
                });
            }
        }
    })();
});

module.exports = router;