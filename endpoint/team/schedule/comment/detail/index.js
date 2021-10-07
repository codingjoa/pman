const TeamScheduleCommentDetailDAO = require('./dao');
module.exports = {
  Delete(req, res, next) {
    const dao = new TeamScheduleCommentDetailDAO(req);
    dao.delete(res).catch(err => next(err));
  },
  Update(req, res, next) {
    const dao = new TeamScheduleCommentDetailDAO(req);
    dao.update(res).catch(err => next(err));
  }
}
