module.exports = function initSession(app) {
  const session = require('express-session');
  const sessionOption = {
    secret: 'development',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: ((process.env.DEBUG === '1') ? Infinity : (1000 * 60 * 30))
    }
  };
  app.set('trust proxy', 1);
  app.use(session(sessionOption));
}
