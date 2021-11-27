const DAO = require('../loadModules').DAO;
const env = require('../loadModules').env;
const jwt = require('./jwt');
const axios = require('axios');
const FileSystem = require('../loadModules').FileSystem;
class Error400Parameter extends Error {}
class Error400 extends Error {}
class Error401 extends Error {}
class Error403 extends Error {}
class Error404 extends Error {}
class Error500 extends Error {}


class Model {
  static Error400Parameter = Error400Parameter;
  static Error400 = Error400;
  static Error401 = Error401;
  static Error403 = Error403;
  static Error404 = Error404;
  static Error500 = Error500;
  static env = env;

  constructor(req) {
    this.dao = new DAO(); // db 상호작용에 사용
    this.jwt = jwt; // oauth와 invite 기능에 사용
    this.requestUserID = req.user?.id;
    this.file = null; // useFilesystem을 호출하는 자식 생성자에서만 사용.
  }

  useFilesystem(file, dir) {
    this.file = new FileSystem(file, dir);
  }

  publishWebhook(url, user, message) {
    setImmediate(() => {
      const {
        username,
        avatar_url,
      } = user;
      axios({
        method: 'POST',
        url,
        data: {
          username,
          avatar_url,
          embeds: [{
            description: message,
          }],
        },
      }).catch(console.error);
    });

  }

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
