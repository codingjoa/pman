const TeamUserDAO = require('./dao');

module.exports = {
  Delete(req, res, next) {
    const dao = new TeamUserDAO(req);
    dao.delete(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamUserDAO(req);
    dao.read(res).catch(err => next(err));
  }
};
