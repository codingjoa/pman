const TeamInviteDao = require('./dao');
module.exports = {
  Read(req, res, next) {
    const dao = new TeamInviteDao(req);
    dao.read(res).catch(err => next(err));
  }
}
