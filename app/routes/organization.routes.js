const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/results_resource', async (req, res) => {
    let newUrl = 'http://' + req.body.urlHost + '/api/3/action/datastore_search?resource_id='
        + req.body.resourceID;

    let resource;
    await fetch(newUrl)
        .then(res => res.json())
        .then((out) => {
            resource = out;
        })
        .catch(err => { throw err });

    res.render('resultsResource', {
        resource: resource.result,
        title: "Resource analysis results"
    });
});

module.exports = router;