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
    body('url', 'Invalid URL')
        .trim()
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
        // get all datasets and then analyze one by one
        let newUrl = reqUrl.protocol + '//' + reqUrl.host + '/api/3/action/package_list';

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                data = out;
            })
            .catch(err => { throw err });


        res.render('results', {
            data: data.result,
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
        req.session.errors = errors.array();
        res.redirect('/menu');
    } else {
        let reqUrl = new URL(req.body.url);
        let pathName = reqUrl.pathname.split('/');
        let newUrl = reqUrl.protocol + '//' + reqUrl.host
            + '/api/3/action/package_show?id=' + pathName[pathName.length - 1];

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                data = out;
            })
            .catch(err => { throw err });

        // res.set('Content-Type', 'text/css');
        res.render('results', {
            data: data.result,
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
        req.session.errors = errors.array();
        res.redirect('/menu');
    } else {
        let reqUrl = new URL(req.body.url);
        let pathName = reqUrl.pathname.split('/');
        let newUrl = reqUrl.protocol + '//' + reqUrl.host
            + '/api/3/action/organization_show?id=' + pathName[pathName.length - 1];

        let data;
        await fetch(newUrl)
            .then(res => res.json())
            .then((out) => {
                data = out;
            })
            .catch(err => { throw err });

        res.render('results', {
            data: data.result,
            title: "Results"
        });
    }
});

module.exports = router;