const TeamDAO = require('./dao');

module.exports = {
  Create(req, res, next) {
    const dao = new TeamDAO(req);
    dao.isAuthorized().createTeam(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamDAO(req);
    dao.isAuthorized().getTeams(res).catch(err => next(err));
  }
};
