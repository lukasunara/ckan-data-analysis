
const express = require('express');
// const fetch = require("node-fetch");
// const getJSON = require("get-json");
const router = express.Router();

router.get('/', function (req, res) {
    res.render('test', {
        title: "Test"
    });
});

module.exports = router;