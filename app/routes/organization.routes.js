const express = require('express');
const router = express.Router();

router.get('/dataset/:datasetID', async (req, res) => {
    res.redirect('/portal/' + portalName + '/dataset/' + datasetID);
});

module.exports = router;