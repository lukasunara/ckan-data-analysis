const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const session = require('express-session');

const homeRouter = require('./routes/home.routes');
const menuRouter = require('./routes/menu.routes');
const portalRouter = require('./routes/portal.routes');
const datasetRouter = require('./routes/dataset.routes');
const organizationRouter = require('./routes/organization.routes');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: 'ckan-connect.sid',
    secret: 'CKAN-data-analysis-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));

app.use('/', homeRouter);
app.use('/menu', menuRouter);
app.use('/menu/results_portal', portalRouter);
app.use('/menu/results_dataset', datasetRouter);
app.use('/menu/results_organization', organizationRouter);

app.listen(port, () => console.log(`Server started on port ${port}!`));