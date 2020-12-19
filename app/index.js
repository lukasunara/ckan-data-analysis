const express = require('express');
const app = express();
const path = require('path');
const port = 8000;

const homeRouter = require('./routes/home.routes');
const testRouter = require('./routes/test.routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use('/', homeRouter);
app.use('/test', testRouter);

app.listen(port);