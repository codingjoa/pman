const TeamScheduleDetailDAO = require('./dao');
module.exports = {
  Delete(req, res, next) {
    const dao = new TeamScheduleDetailDAO(req);
    dao.delete(res).catch(err => next(err));
  },
  Patch(req, res, next) {
    const dao = new TeamScheduleDetailDAO(req);
    dao.patch(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamScheduleDetailDAO(req);
    dao.read(res).catch(err => next(err));
  }
}
