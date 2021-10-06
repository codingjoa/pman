const TeamDAO = require('./dao');

module.exports = {
  Create(req, res, next) {
    const dao = new TeamDAO(req);
    dao.create(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamDAO(req);
    dao.read(res).catch(err => next(err));
  }
};
