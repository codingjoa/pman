const TeamDocsDAO = require('./dao');
module.exports = {
  Create(req, res, next) {
    const dao = new TeamDocsDAO(req);
    dao.create(res).catch(err => next(err));
  },
  Read(req, res, next) {
    const dao = new TeamDocsDAO(req);
    dao.read(res).catch(err => next(err));
  }
};
