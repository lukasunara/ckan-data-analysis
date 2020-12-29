const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.render('home', {
        title: 'Home'
    });
});

/*
router.get('/package_list', async function (req, res) {
    let url = 'http://data.rijeka.hr/api/action/package_list';
    let data;
    await fetch(url)
        .then(res => res.json())
        .then((out) => {
            console.log('Checkout this JSON! ', out);
            data = out;
        })
        .catch(err => { throw err });

    res.render('test', {
        data: data,
        title: "Test"
    });
});

router.get('/package_show', async function (req, res) {
    let url = new URL('http://data.rijeka.hr/api/action/package_show?');
    let params = {
        id: 'autobusne-stanice'
    };
    url.search = new URLSearchParams(params).toString();

    let data;
    await fetch(url)
        .then(res => res.json())
        .then((out) => {
            console.log('Checkout this JSON! ', out);
            data = out;
        })
        .catch(err => { throw err });

    res.render('test', {
        data: data,
        title: "Test"
    });
});

router.get('/resource', async function (req, res) {
    let url = new URL('http://data.rijeka.hr/api/action/datastore_search?');
    let params = {
        resource_id: '76231ce7-e776-4220-ada1-1542f06cc8b4'
    };
    url.search = new URLSearchParams(params).toString();

    let data;
    await fetch(url)
        .then(res => res.json())
        .then((out) => {
            console.log('Checkout this JSON! ', out);
            console.log('Total results found: ' + out.result.total);
            data = out;
        })
        .catch(err => { throw err });

    res.render('test', {
        data: data,
        title: "Test"
    });
});
*/

module.exports = router;