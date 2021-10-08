const TeamScheduleSubmitDetailDAO = require('./dao');
module.exports = {
  Delete(req, res, next) {
    const dao = new TeamScheduleSubmitDetailDAO(req);
    dao.delete(res).catch(err => next(err));
  }
}
