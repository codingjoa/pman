const maria = require('../loadModules').maria;
const DAO = require('../loadModules').DAO;
const jwt = require('./jwt');
const level = require('level');
const FileSystem = require('./file');
class Error400Parameter extends Error {}
class Error401 extends Error {}
class Error403Forbidden extends Error {}
class Error404 extends Error {}


class Model {
  constructor(req) {
    this.query = maria('query'); // 더이상 사용되지 않음
    this.dao = new DAO(); // db 상호작용에 사용
    this.jwt = jwt; // oauth와 invite 기능에 사용
    this.requestUserID = req.user?.id;
    this.level = level;
    this.file = null; // useFilesystem을 호출하는 자식 생성자에서만 사용.
  }

  useFilesystem(file, dir) {
    this.file = new FileSystem(file, dir);
  }

  static Error400Parameter = Error400Parameter;
  static Error401 = Error401;
  static Error403Forbidden = Error403Forbidden;
  static Error404 = Error404;

  checkParameters() {
    for(const arg of arguments) {
      if(arg === undefined || arg === NaN) {
        throw new Error400Parameter();
      }
    }
  }

  isAuthorized() {
    if(!this.requestUserID) {
      throw new Error401();
    }
    return this;
  }
}
module.exports = Model;
