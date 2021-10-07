const TeamScheduleDAO = require('../dao');

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
const uploadFileExecute = upload.single('file');

class TeamScheduleFileDAO extends TeamScheduleDAO {
  constructor(req) {
    super(req);
    this.req = req;
  }

  async uploadFile(res) {
    return new Promise((resolve, reject) => {
      uploadFileExecute(this.req, res, err => {
        if(err) {
          reject(err);
          return;
        }
        resolve({
          fileName: this.req?.file?.originalname,
          file: this.req?.file?.filename,
          path: this.req?.file?.path
        });
      });
    });
  }

  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query(
`select
  teamFiles.fileUUID
from
  teamSchedule left join
  teamFiles on
    teamSchedule.fileUUID=teamFiles.fileUUID
where
  teamSchedule.scheduleID=? and
  teamSchedule.teamID=?`, [
      this.scheduleID, this.teamID
    ])(result => {
      // 파일 유무 검사
      const p = result.rows?.[0];
      if(p?.fileUUID) {
        fs.rmSync(path.join(ROOT, 'static/file', p.fileUUID));
      }
      res.json({
        complete: true
      });
      return { fileUUID };
    })('delete from teamFiles where fileUUID=?', storage => ([
      storage.fileUUID
    ]))();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query(
`select
  teamFiles.fileUUID,
  teamFiles.fileName
from
  teamSchedule left join
  teamFiles on
    teamSchedule.fileUUID=teamFiles.fileUUID
where
  teamSchedule.teamID=? and
  teamSchedule.scheduleID=?`, [
      this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      if(!p?.fileUUID) {
        throw new Error('404 파일 없음');
      }
      res.download(path.join(ROOT, 'static/file', p.fileUUID), p.fileName);
    })();
  }

  async update(res) {
    this.isAuthorized();

    this.checkUpdatePermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query(
`select
  teamFiles.fileUUID
from
  teamSchedule left join
  teamFiles on
    teamSchedule.fileUUID=teamFiles.fileUUID
where
  teamSchedule.scheduleID=? and
  teamSchedule.teamID=?`, [
      this.scheduleID, this.teamID
    ])(result => {
      // 파일 유무 검사
      if(result.rows?.[0]?.fileUUID) {
        throw new Error('400 파일 존재함');
      }
      // TODO: 썸네일 제작 기능 추가해야 함
      return this.uploadFile(res);
    })((result, storage) => {
      if(!storage?.file) {
        throw new Error('400 파일 없음');
      }
    })('insert into teamFiles(fileUUID, fileName) values(?, ?)', storage => ([
      storage.file, storage.fileName
    ]))('update teamSchedule set teamSchedule.fileUUID=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', storage => ([
      storage.file, this.teamID, this.scheduleID
    ]))((result, storage) => {
      if(!result.affectedRows) {
        fs.rmSync(storage.path);
        throw new Error();
      }
      res.json({
        complete: true,
        fileName: storage.fileName
      });
    })();
  }
}
module.exports = TeamScheduleFileDAO;
