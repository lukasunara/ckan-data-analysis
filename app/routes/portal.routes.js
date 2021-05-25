const express = require('express');
const router = express.Router({ mergeParams: true });

const Portal = require('../models/data/PortalModel.js');
const Organization = require('../models/data/OrganizationModel.js');
const Dataset = require('../models/data/DatasetModel.js');
const Resource = require('../models/data/ResourceModel.js');
const AnalysisResult = require('../models/data/AnalysisResult.js');

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

// get '/portal/:portalName
router.get('/', function (req, res) {
    (async () => {
        let params = req.params.portalName.split('-');
        var portalName = params.length == 1 ? params[0] : params[0] + '/' + params[1];

        if (!portalName) {
            redirectToWithError(res, req, '/home');
        } else {
            let portal = await Portal.fetchPortalByName(portalName);
            if (!portal) {
                let result = await analysePortal(portalName);
                if (result.failed) {
                    redirectToWithError(res, req, '/home');
                    return;
                } else {
                    portal = result.portal;
                }
            } else {
                portal.result = await AnalysisResult.createAnalysisResult(portal.object_id);
                if (portal.result.isEmpty())
                    await portal.analysePortal();
            }
            if (!portal.organizations)
                portal.organizations = await portal.fetchOrganizations();

            res.render('portal', {
                linkActive: 'home',
                title: "Portal analysis results",
                portalName: req.params.portalName,
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
                    let newResult = await analyseDataset(portalName, datasetID);
                    if (newResult.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                        return;
                    } else {
                        dataset = newResult.dataset;
                    }
                } else {
                    dataset.result = await AnalysisResult.createAnalysisResult(dataset.object_id);
                    if (dataset.result.isEmpty())
                        await dataset.analyseDataset();
                }
                if (!dataset.resources)
                    dataset.resources = await dataset.fetchResources();

                res.render('dataset', {
                    linkActive: 'home',
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
                    let newResult = await analyseOrganization(portalName, organizationID);
                    if (newResult.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                        return;
                    } else {
                        organization = newResult.organization;
                    }
                } else {
                    organization.result = await AnalysisResult.createAnalysisResult(organization.object_id);
                    if (organization.result.isEmpty())
                        await organization.analyseOrganization();
                }
                if (!organization.datasets)
                    organization.datasets = await organization.fetchDatasets();

                res.render('organization', {
                    linkActive: 'home',
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
                return;
            } else {
                let resource = await Resource.fetchResourceById(result.resourceData.id);
                if (!resource) {
                    resource = await analyseResource(portalName, resourceID);
                    if (resource.failed) {
                        redirectToWithError(res, req, '/portal/' + portalName);
                    }
                } else {
                    resource.result = await AnalysisResult.createAnalysisResult(resource.object_id);
                    if (resource.result.isEmpty())
                        await resource.analyseOrganization();
                }
                res.render('resource', {
                    linkActive: 'home',
                    title: "Resource analysis results",
                    objectData: resource,
                    overallResults: resource.result.getOverallRating()
                });
            }
        }
    })();
});

module.exports = router;