const TeamScheduleFileDAO = require('./dao');
module.exports = {
  Delete(req, res, next) {
    const dao = new TeamScheduleFileDAO(req);
    dao.delete(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamScheduleFileDAO(req);
    dao.read(res).catch(err => next(err));
  },
  Update(req, res, next) {
    const dao = new TeamScheduleFileDAO(req);
    dao.update(res).catch(err => next(err));
  }
};
