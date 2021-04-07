const express = require('express');
const { URL } = require('url');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', function (req, res) {
    res.render('menu', {
        title: 'Menu',
        linkActive: 'menu'
    });
});

router.post('/portal', [
    body('url', 'Invalid URL!')
        .trim()
        .not().isEmpty().withMessage('URL is empty!')
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.redirect('/menu');
    } else {
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
        res.redirect('/menu');
    } else {
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
        res.redirect('/menu');
    } else {
        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        res.redirect('/portal/' + portalName + '/organization/' + pathName[pathName.length - 1]);
    }
});

module.exports = router;