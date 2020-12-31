const express = require('express');
const fetch = require('node-fetch');
const { URL } = require('url');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', function (req, res) {
    console.log(req.session.errors);
    res.render('menu', {
        title: 'Menu',
        success: req.session.success,
        errors: req.session.errors
    });
    // delete req.session['errors'];
    req.session.errors = null;
    req.session.success = true;
    console.log(req.session.errors);
});

router.post('/results_portal', [
    body('url', 'Invalid URL!')
        .trim()
        .not().isEmpty().withMessage('URL is empty!')
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        req.session.success = false;
        res.redirect('/menu');
    } else {
        req.session.success = true;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;

        let datasetsUrl = reqUrl.protocol + '//' + portalName + '/api/3/action/package_list';
        let datasets;
        await fetch(datasetsUrl)
            .then(res => res.json())
            .then((out) => {
                datasets = out;
            })
            .catch(err => { throw err });

        let organizationsUrl = reqUrl.protocol + '//' + portalName + '/api/3/action/organization_list';
        let organizations;
        await fetch(organizationsUrl)
            .then(res => res.json())
            .then((out) => {
                organizations = out;
            })
            .catch(err => { throw err });

        res.render('resultsPortal', {
            portalName: portalName,
            datasets: datasets.result,
            organizations: organizations.result,
            title: "Portal analysis results"
        });
    }
});

router.post('/results_dataset', [
    body('url', 'Invalid URL!')
        .trim()
        .not().isEmpty().withMessage('URL is empty!')
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        req.session.success = false;
        res.redirect('/menu');
    } else {
        req.session.success = true;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        let newUrl = reqUrl.protocol + '//' + portalName
            + '/api/3/action/package_show?id=' + pathName[pathName.length - 1];

        let dataset;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                dataset = out;
            })
            .catch(err => { throw err });

        res.render('resultsDataset', {
            portalName: portalName,
            dataset: dataset.result,
            title: "Dataset analysis results"
        });
    }
});

router.post('/results_organization', [
    body('url', 'Invalid URL!')
        .trim()
        .not().isEmpty().withMessage('URL is empty!')
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        req.session.success = false;
        res.redirect('/menu');
    } else {
        req.session.success = true;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        let newUrl = reqUrl.protocol + '//' + portalName
            + '/api/3/action/organization_show?id=' + pathName[pathName.length - 1];

        let organization;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                organization = out;
            })
            .catch(err => { throw err });

        res.render('resultsOrganization', {
            portalName: portalName,
            organization: organization.result,
            title: "Organization analysis results"
        });
    }
});

module.exports = router;