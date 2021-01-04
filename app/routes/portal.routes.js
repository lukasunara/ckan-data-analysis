const express = require('express');
const fetch = require('node-fetch');
const router = express.Router({ mergeParams: true });

router.get('/', function (req, res) {
    (async () => {
        let datasetsUrl = 'http://' + req.params.portalName + '/api/3/action/package_list';
        let datasets;
        await fetch(datasetsUrl)
            .then(res => res.json())
            .then((out) => {
                datasets = out;
            })
            .catch(err => { throw err });

        let organizationsUrl = 'http://' + req.params.portalName + '/api/3/action/organization_list';
        let organizations;
        await fetch(organizationsUrl)
            .then(res => res.json())
            .then((out) => {
                organizations = out;
            })
            .catch(err => { throw err });

        res.render('portal', {
            portalName: req.params.portalName,
            datasets: datasets.result,
            organizations: organizations.result,
            title: "Portal analysis results"
        });
    })();
});

router.get('/dataset/:datasetID', function (req, res) {
    (async () => {
        let newUrl = 'http://' + req.params.portalName + '/api/3/action/package_show?id='
            + req.params.datasetID;

        let dataset;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                dataset = out;
            })
            .catch(err => { throw err });

        res.render('dataset', {
            portalName: req.params.portalName,
            dataset: dataset.result,
            title: "Dataset analysis results"
        });
    })();
});

router.get('/organization/:organizationID', function (req, res) {
    (async () => {
        let newUrl = 'http://' + req.params.portalName + '/api/3/action/organization_show?id='
            + req.params.organizationID;

        let organization;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                organization = out;
            })
            .catch(err => { throw err });

        res.render('organization', {
            portalName: req.params.portalName,
            organization: organization.result,
            title: "Organization analysis results"
        });
    })();
});

router.get('/resource/:resourceID', async (req, res) => {
    let newUrl = 'http://' + req.params.portalName + '/api/3/action/resource_show?id='
        + req.params.resourceID;

    let resource;
    await fetch(newUrl)
        .then(res => res.json())
        .then((out) => {
            resource = out;
        })
        .catch(err => { throw err });

    res.render('resource', {
        resource: resource.result,
        title: "Resource analysis results"
    });
});

module.exports = router;