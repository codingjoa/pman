module.exports = function init(app) {
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());
}
