const express = require('express');
const fetch = require('node-fetch');
const router = express.Router({ mergeParams: true });

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