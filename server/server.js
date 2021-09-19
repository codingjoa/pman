const express = require('express');
const app = express();
const env = require('./environment');

require('./init')(app);
env.PROXY && require('./init.proxy')(app);
//env.MARIADB && require('./init.mariadb')(app);
//env.SQLITE && require('./init.sqlite')(app);
env.JWT && require('./init.jwt')(app);
env.SESSION && require('./init.session')(app);

const loader = require('./loader');
const api = loader(app);

//api('/account', require('./CRUD/account'));
//api('/user', users)('/:id', user);

module.exports = api;
