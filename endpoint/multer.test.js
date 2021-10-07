const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const uuidv4 = require('uuid').v4;
const multer = require('multer');
const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'static/file/');
  },
  filename(req, file, cb) {
    cb(null, uuidv4());
  }
});
const upload = multer({
  dest: 'static/file/',
  limits: {
    fieldSize: '2MB',
    fields: 5,
    fileSize: '10MB'
  }
});
const uploadFile = upload.single('file');

module.exports = {
  Update(req, res, next) {
    uploadFile(req, res, err => {
      if(err) {
        next(err);
        return;
      }
      res.json({
        file: req.file,
        body: req.body
      });
    });
  }
};
