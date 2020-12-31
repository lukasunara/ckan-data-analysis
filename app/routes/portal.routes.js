const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/results_dataset', async (req, res) => {
    let newUrl = 'http://' + req.body.urlHost + '/api/3/action/package_show?id=' + req.body.datasetID;
    let dataset;
    await fetch(newUrl)
        .then(res => res.json())
        .then((out) => {
            dataset = out;
        })
        .catch(err => { throw err });

    res.render('resultsDataset', {
        dataset: dataset.result,
        title: "Dataset analysis results"
    });
});

router.post('/results_organization', async (req, res) => {
    let newUrl = 'http://' + req.body.urlHost + '/api/3/action/organization_show?id=' + req.body.organizationID;
    let organization;
    await fetch(newUrl)
        .then(res => res.json())
        .then((out) => {
            organization = out;
        })
        .catch(err => { throw err });

    res.render('resultsOrganization', {
        organization: organization.result,
        title: "Organization analysis results"
    });
});

module.exports = router;