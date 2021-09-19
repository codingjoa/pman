const Error = require('./Schema/Error');
module.exports = (err, req, res, next) => {
  console.error(err);
  if(res.headersSent) {
    return next(err);
  }
  const errSchema = Error(err);
  res.status(errSchema.status);
  res.json(errSchema);
  res.end();
  next();
};
