const maria = require('../loadModules').maria;
class DAO {
  constructor(req) {
    this.query = maria('query');
    this.requestUserID = req.user?.id;
  }

  isAuthorized() {
    if(!this.requestUserID) {
      throw new Error('401 Unauthorized');
    }
    return this;
  }
}
module.exports = DAO;
