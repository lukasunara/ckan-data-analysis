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
        portalName: req.body.urlHost,
        dataset: dataset.result,
        title: "Dataset analysis results"
    });
});

module.exports = router;