module.exports = function initProxy(app) {
  const cors = require('cors');
  app.set('trust proxy', 1);
  app.use(cors());
}
