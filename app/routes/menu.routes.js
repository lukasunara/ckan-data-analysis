const express = require('express');
const fetch = require('node-fetch');
const url = require('url');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', function (req, res) {
    var errors = null;
    if (req.errors) {
        errors = req.errors;
    }
    res.render('menu', {
        title: 'Menu',
        errors: errors
    });
});

router.post('/results_portal', [
    body('url', 'Invalid URL')
        .trim()
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.errors = errors.array();
        res.redirect('/');
    } else {
        let reqUrl = new URL(req.body.url);
        // dohvatit ćemo sve datasetove pa ih analizirati jednog po jednog
        let newUrl = reqUrl.protocol + '//' + reqUrl.host + '/api/3/action/package_list';

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                // data = JSON.parse(out);
                data = out;
            })
            .catch(err => { throw err });

        res.render('results', {
            data: data,
            title: "Results"
        });
    }
});

router.post('/results_dataset', [
    body('url', 'Invalid URL')
        .trim()
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.errors = errors.array();
        res.redirect('/');
    } else {
        let reqUrl = new URL(req.body.url);
        let pathName = reqUrl.pathname.split('/');
        let newUrl = reqUrl.protocol + '//' + reqUrl.host
            + '/api/3/action/package_show?id=' + pathName[pathName.length - 1];

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                // data = JSON.parse(out);
                data = out;
            })
            .catch(err => { throw err });

        res.render('results', {
            data: data,
            title: "Results"
        });
    }
});

router.post('/results_organization', [
    body('url', 'Invalid URL')
        .trim()
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.errors = errors.array();
        res.redirect('/');
    } else {
        let reqUrl = new URL(req.body.url);
        let pathName = reqUrl.pathname.split('/');
        let newUrl = reqUrl.protocol + '//' + reqUrl.host
            + '/api/3/action/organization_show?id=' + pathName[pathName.length - 1];

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                // data = JSON.parse(out);
                data = out;
            })
            .catch(err => { throw err });

        res.render('results', {
            data: data,
            title: "Results"
        });
    }
});

module.exports = router;