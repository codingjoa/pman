const TeamScheduleDAO = require('../dao');

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const multer = require('multer');
const upload = multer({
  dest: 'static/file/',
  limits: {
    fieldSize: '2MB',
    fields: 5,
    fileSize: '10MB'
  }
});
const uploadFile = upload.single('file');

class TeamScheduleFileDAO extends TeamScheduleDAO {
  constructor(req) {
    super(req);
    this.req = req;
  }

  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query('select teamScheduleFile.scheduleFile from teamSchedule left join teamScheduleFile on teamSchedule.scheduleID=teamScheduleFile.scheduleID where teamSchedule.scheduleID=? and teamSchedule.teamID=?', [
      this.scheduleID, this.teamID
    ])(result => {
      // 파일 유무 검사
      const p = result.rows?.[0];
      if(p?.scheduleFile) {
        fs.rmSync(path.join(ROOT, 'static/file', p.scheduleFile));
      }
      res.json({
        complete: true
      });
    })('delete from teamScheduleFile where scheduleID=? and teamID=?', [
      this.scheduleID, this.teamID
    ])();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query('select teamScheduleFile.scheduleFile, teamScheduleFile.scheduleFileName from teamScheduleFile where teamScheduleFile.teamID=? and teamScheduleFile.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      if(!p?.scheduleFile) {
        throw new Error('404 파일 없음');
      }
      res.download(path.join(ROOT, 'static/file', p.scheduleFile), p.scheduleFileName);
    })();
  }

  async update(res) {
    this.isAuthorized();

    this.checkUpdatePermissions();

    this.checkParameters(this.scheduleID, this.teamID);
    return this.query('select teamScheduleFile.scheduleFile from teamSchedule left join teamScheduleFile on teamSchedule.scheduleID=teamScheduleFile.scheduleID where teamSchedule.scheduleID=? and teamSchedule.teamID=?', [
      this.scheduleID, this.teamID
    ])(result => {
      // 파일 유무 검사
      if(result.rows?.[0]?.scheduleFile) {
        throw new Error('400 파일 존재함');
      }
      // TODO: 썸네일 제작 기능 추가해야 함
      return new Promise((resolve, reject) => {
        uploadFile(this.req, res, err => {
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
    })((result, storage) => {
      if(!storage?.file) {
        throw new Error('400 파일 없음');
      }
    })('insert into teamScheduleFile(scheduleFile,scheduleFileName, scheduleID, teamID) values(?, ?, ?, ?)', storage => ([
      storage.file, storage.fileName, this.scheduleID, this.teamID
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
