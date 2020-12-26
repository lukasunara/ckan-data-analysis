const express = require('express');
// const fetch = require('node-fetch');
// const { URL, URLSearchParams } = require('url');
const router = express.Router();

router.get('/', function (req, res) {
    res.render('menu', {
        title: 'Menu'
    });
});

module.exports = router;