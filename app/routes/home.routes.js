const express = require('express');
const { URL } = require('url');
const { body, validationResult } = require('express-validator');
const router = express.Router();

var errorURL = null;

router.get('/', function (req, res) {
    res.render('home', {
        title: 'Home',
        linkActive: 'home',
        errorURL: errorURL
    });
    errorURL = null;
});

router.post('/portal', [
    body('url', 'Invalid URL!')
        .trim()
        .not().isEmpty().withMessage('URL is empty!')
        .isURL()
], async function (req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errorURL = true;
        res.redirect('/home');
    } else {
        let reqUrl = new URL(req.body.url);
        let portalName = reqUrl.host;
        let pathName = reqUrl.pathname.split('/');

        switch (req.body.typeOfElement) {
            case 'radioPortal': {
                if (pathName.length > 1 && pathName[1] != '') {
                    portalName += '-' + pathName[1];
                }
                res.redirect('/portal/' + portalName);
                break;
            }
            case 'radioDataset': {
                let datasetID = pathName[pathName.length - 1];
                if (!datasetID) {
                    errorURL = true;
                    res.redirect('/home');
                } else {
                    res.redirect('/portal/' + portalName + '/dataset/' + datasetID);
                }
                break;
            }
            case 'radioOrganization': {
                let organizationID = pathName[pathName.length - 1];
                if (!organizationID) {
                    errorURL = true;
                    res.redirect('/home');
                } else {
                    res.redirect('/portal/' + portalName + '/organization/' + organizationID);
                }
                break;
            }
        }
    }
});

module.exports = router;