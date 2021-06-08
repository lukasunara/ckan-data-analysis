const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const schedule = require('node-schedule');

const homeRouter = require('./routes/home.routes');
const portalRouter = require('./routes/portal.routes');

const Portal = require('./models/data/PortalModel');
const { analysePortal } = require('./public/scripts/analysis/analysePortal');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use('/', homeRouter);
app.use('/portal/:portalName', portalRouter);

// "cron" job for refreshing data scheduled every Sunday at 02:30h
schedule.scheduleJob('30 2 * * 0', async function () {
    // console.log('started');
    try {
        let portals = await Portal.fetchAllPortalsFromDB();
        for (let portal of portals) {
            await analysePortal(portal.object_id);
        }
    } catch (err) {
        console.log(err);
    }
    // console.log('ended');
});

app.listen(port, () => console.log(`Server started on port ${port}!`));