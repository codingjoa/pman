module.exports = function initSession(app) {
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({
    extended: false,
    limit: '64mb'
  }));
}
