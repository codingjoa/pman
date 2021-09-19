module.exports = function init(app) {
  const jwt = require('express-jwt');
  const cookieParser = require('cookie-parser');
  app.use(jwt({
    secret: 'development',
    algorithms: ['HS256'],
    credentialsRequired: false
  }));
  app.use(cookieParser());
}
