const express = require('express');
const router = express.Router({ mergeParams: true });

const Portal = require('../models/data/PortalModel.js');
const Organization = require('../models/data/OrganizationModel.js');
const Dataset = require('../models/data/DatasetModel.js');
const Resource = require('../models/data/ResourceModel.js');

const { redirectToWithError } = require('../public/scripts/utils/fetching.js');
const { analysePortal } = require('../public/scripts/analysis/analysePortal.js');
const {
    analyseOrganization,
    fetchOrganizationData
} = require('../public/scripts/analysis/analyseOrganization.js');
const {
    analyseDataset,
    fetchDatasetData
} = require('../public/scripts/analysis/analyseDataset.js');
const {
    fetchResourceData,
    analyseResource
} = require('../public/scripts/analysis/analyseResource.js');
const AnalysisResult = require('../models/data/AnalysisResult.js');

// get '/portal/:portalName
router.get('/', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];

        if (!portalName) {
            redirectToWithError(res, req, '/menu');
        } else {
            let portal = await Portal.fetchPortalWithCharts();
            if (!portal) {
                portal = analysePortal(portalName);
                if (portal.failed) {
                    redirectToWithError(res, req, '/menu');
                }
            } else {
                portal.result = AnalysisResult.createAnalysisResult(portal.object_id);
            }
            res.render('portal', {
                linkActive: 'menu',
                title: "Portal analysis results",
                portalName: req.params.portalName,
                datasets: datasets.data.result,
                organizations: organizations.data.result,
                objectData: portal,
                overallResults: portal.result.getOverallRating()
            });
        }
    })();
});

// get '/portal/:portalName/dataset/:datasetID
router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var datasetID = req.params.datasetID;

        if (!datasetID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let result = await fetchDatasetData(portalName, datasetID);
            if (result.failed) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let dataset = await Dataset.fetchDatasetById(result.datasetData.id);
                if (!dataset) {
                    dataset = analyseDataset(portalName, datasetID);
                    if (dataset.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                    }
                } else {
                    dataset.result = AnalysisResult.createAnalysisResult(dataset.object_id);
                }
                res.render('dataset', {
                    linkActive: 'menu',
                    title: "Dataset analysis results",
                    portalName: req.params.portalName,
                    objectData: dataset,
                    overallResults: dataset.result.getOverallRating()
                });
            }
        }
    })();
});

// get '/portal/:portalName/organization/:organizationID
router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var organizationID = req.params.organizationID;

        if (!organizationID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let result = await fetchOrganizationData(portalName, organizationID);
            if (result.failed) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let organization = await Organization.fetchOrganizationById(result.organizationData.id);
                if (!organization) {
                    organization = analyseOrganization(portalName, organizationID);
                    if (organization.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                    }
                } else {
                    organization.result = AnalysisResult.createAnalysisResult(organization.object_id);
                }
                res.render('organization', {
                    linkActive: 'menu',
                    title: "Organization analysis results",
                    portalName: req.params.portalName,
                    objectData: organization,
                    overallResults: organization.result.getOverallRating()
                });
            }
        }
    })();
});

// get '/portal/:portalName/resource/:resourceID
router.get('/resource/:resourceID', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];
        var resourceID = req.params.resourceID;

        if (!resourceID) {
            redirectToWithError(res, req, '/portal/' + portalName);
        } else {
            let result = await fetchResourceData(portalName, resourceID);
            if (result.failed) {
                redirectToWithError(res, req, '/portal/' + portalName);
            } else {
                let resource = await Resource.fetchResourceById(result.resourceData.id);
                if (!resource) {
                    resource = analyseResource(portalName, resourceID);
                    if (resource.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                    }
                } else {
                    resource.result = AnalysisResult.createAnalysisResult(resource.object_id);
                }
                res.render('resource', {
                    linkActive: 'menu',
                    title: "Resource analysis results",
                    objectData: resource,
                    overallResults: resource.result.getOverallRating()
                });
            }
        }
    })();
});

module.exports = router;