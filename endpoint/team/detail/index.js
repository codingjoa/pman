const TeamDetailDao = require('./dao');
module.exports = {
  Read(req, res, next) {
    const dao = new TeamDetailDao(req);
    dao.read(res).catch(err => next(err));
  }
}
