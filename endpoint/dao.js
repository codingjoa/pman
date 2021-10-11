const maria = require('../loadModules').maria;
const level = require('level');
class DAO {
  constructor(req) {
    this.query = maria('query');
    this.requestUserID = req.user?.id;
    this.level = level;
  }

  checkParameters() {
    for(const arg of arguments) {
      if(arg === undefined || arg === NaN) {
        throw new Error('400 파라미터 오류');
      }
    }
  }

  isAuthorized() {
    if(!this.requestUserID) {
      throw new Error('401 Unauthorized');
    }
    return this;
  }
}
module.exports = DAO;
