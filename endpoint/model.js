const createDao = require('../loadModules').DAO;
const DAO = createDao({
  host: 'localhost',
  port: process.env.MARIADB_PORT ?? 3306,
  user: 'ky',
  database: process.env.MARIADB_NAME,
  password: '1234',
  connectionLimit: 5,
});
const jwt = require('./jwt');
const axios = require('axios');
const FileSystem = require('../loadModules').FileSystem;
class Error400Parameter extends Error {}
class Error400 extends Error {}
class Error401 extends Error {}
class Error403 extends Error {}
class Error404 extends Error {}
class Error500 extends Error {}



// upload
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '/home/ky/pman/tmp');
  },
  filename(req, file, cb) {
    cb(null, uuidv4());
    /*
    const extname = checkMimetype(file);
    if(extname) {
      const uuid = uuidv4().replace(/-/gi, '');
      cb(null, `${uuid}.${extname}`);
    } else {
      cb(new Error('400 허용되지 않는 파일 타입'));
    }
    */
  }
});
function checkMimetype(file) {
  let type;
  if(file.mimetype === 'image/png') {
    return 'png';
  }
  if(file.mimetype === 'image/jpeg') {
    return 'jpg';
  }
  if(file.mimetype === 'image/gif') {
    return 'gif';
  }
  return false;
}
const uploadFileExecute = multer({
  storage,
  limits: {
    fieldSize: '2MB',
    fields: 5,
    fileSize: '10MB'
  },
}).single('file');
// download
const path = require('path');
const ROOT = process.cwd();


class Model {
  static Error400Parameter = Error400Parameter;
  static Error400 = Error400;
  static Error401 = Error401;
  static Error403 = Error403;
  static Error404 = Error404;
  static Error500 = Error500;
  static uploadFileExecute = uploadFileExecute;

  constructor(req) {
    this.dao = new DAO(); // db 상호작용에 사용
    this.jwt = jwt; // oauth와 invite 기능에 사용
    this.requestUserID = req.user?.id;
    this.file = null; // useFilesystem을 호출하는 자식 생성자에서만 사용.
  }

  useFilesystem(file, dir) {
    this.file = new FileSystem(file, dir);
  }

  download(res, file) {
    res.download(path.join(ROOT, 'static/file', file.fileUUID), file.fileName);
  }

  publishWebhook(url, user, message, frontUrl) {
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
            author: {
              name: username,
              icon_url: avatar_url,
            },
            title: message,
            url: frontUrl,
            color: 880381,
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
