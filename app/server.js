const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const homeRouter = require('./routes/home.routes');
const menuRouter = require('./routes/menu.routes');
const portalRouter = require('./routes/portal.routes');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use('/', homeRouter);
app.use('/menu', menuRouter);
app.use('/portal/:portalName', portalRouter);

app.listen(port, () => console.log(`Server started on port ${port}!`));