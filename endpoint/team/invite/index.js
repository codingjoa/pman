const TeamInviteDao = require('./dao');
module.exports = {
  Create(req, res, next) {
    const dao = new TeamInviteDao(req);
    dao.create(res).catch(err => next(err));
  }
}
