module.exports = (app) => {
  const Model = require('./model');
  app(Model);
  app.child('/team', require('./team'));
  app.child('/user/me', require('./user'));
  app.child('/oauth', require('./oauth'));
}
