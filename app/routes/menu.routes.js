const express = require('express');
const { URL } = require('url');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', function (req, res) {
    // console.log(req.session.errors);
    res.render('menu', {
        title: 'Menu',
        success: req.session.success,
        errors: req.session.errors,
        error: req.session.error
    });
    // delete req.session['errors'];
    req.session.errors = null;
    req.session.success = true;
    // console.log(req.session.errors);
});

router.post('/portal', [
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
        req.session.errors = null;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;

        res.redirect('/portal/' + portalName);
    }
});

router.post('/dataset', [
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
        req.session.errors = null;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        res.redirect('/portal/' + portalName + '/dataset/' + pathName[pathName.length - 1]);
    }
});

router.post('/organization', [
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
        req.session.errors = null;

        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        res.redirect('/portal/' + portalName + '/organization/' + pathName[pathName.length - 1]);
    }
});

module.exports = router;