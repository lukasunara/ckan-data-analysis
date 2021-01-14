const express = require('express');
const fetch = require('node-fetch');
const router = express.Router({ mergeParams: true });
const { analyseDataset } = require('../public/scripts/datasetAnalysis.js');
const { analyseOrganization } = require('../public/scripts/organizationAnalysis.js');
const { analyseResource } = require('../public/scripts/resourceAnalysis.js');

var fetchData = async (dataUrl) => {
    let data;
    await fetch(dataUrl)
        .then(res => res.json())
        .then((out) => {
            data = out;
        })
        .catch(err => { throw err });

    return data.result;
}

router.get('/', function (req, res) {
    (async () => {
        let datasetsUrl = 'http://' + req.params.portalName + '/api/3/action/package_list';
        let datasets = await fetchData(datasetsUrl);

        let organizationsUrl = 'http://' + req.params.portalName + '/api/3/action/organization_list';
        let organizations = await fetchData(organizationsUrl);

        for (let i = 0; i < datasets.length; i++) {
            let datasetUrl = 'http://' + req.params.portalName
                + '/api/3/action/package_show?id=' + datasets[i];

            let dataset = await fetchData(datasetUrl);
            analyseDataset(dataset);
        }

        for (let i = 0; i < organizations.length; i++) {
            let organizationUrl = 'http://' + req.params.portalName
                + '/api/3/action/organization_show?id=' + organizations[i];

            let organization = await fetchData(organizationUrl);
            analyseOrganization(organization);
        }

        res.render('portal', {
            portalName: req.params.portalName,
            datasets: datasets,
            organizations: organizations,
            title: "Portal analysis results"
        });
    })();
});

router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        let datasetUrl = 'http://' + req.params.portalName + '/api/3/action/package_show?id='
            + req.params.datasetID;

        let dataset = await fetchData(datasetUrl);

        let results = await analyseDataset(dataset);

        res.render('dataset', {
            portalName: req.params.portalName,
            dataset: dataset,
            title: "Dataset analysis results"
        });
    })();
});

router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        let organizationUrl = 'http://' + req.params.portalName + '/api/3/action/organization_show?id='
            + req.params.organizationID;

        let organization = await fetchData(organizationUrl);

        let results = await analyseOrganization(organization);

        res.render('organization', {
            portalName: req.params.portalName,
            organization: organization,
            title: "Organization analysis results"
        });
    })();
});

router.get('/resource/:resourceID', async (req, res) => {
    let resourceUrl = 'http://' + req.params.portalName + '/api/3/action/resource_show?id='
        + req.params.resourceID;

    let resource = await fetchData(resourceUrl);

    let results = await analyseResource(resource);

    res.render('resource', {
        resource: resource,
        title: "Resource analysis results"
    });
});

module.exports = router;