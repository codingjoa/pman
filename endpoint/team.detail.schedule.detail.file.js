const maria = require('../loadModules').maria;
const { UnauthorizationError } = require('../loadModules').Error;
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

module.exports = {
  Delete(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const scheduleID = req.params?.scheduleID - 0;
    const teamID = req.params?.teamID - 0;
    const query = maria('query');
    query('select teamSchedule.scheduleOwnerUserID=? as isScheduleOwn from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      userID, teamID, scheduleID
    ])(result => {
      // 권한 검사
      if(!result.rows?.[0]?.isScheduleOwn) {
        throw new Error('403 권한 없음');
      }
    })('select teamScheduleFile.scheduleFile from teamSchedule left join teamScheduleFile on teamSchedule.scheduleID=teamScheduleFile.scheduleID where teamSchedule.scheduleID=? and teamSchedule.teamID=?', [
      scheduleID, teamID
    ])(result => {
      // 파일 유무 검사
      if(result.rows?.[0]?.scheduleFile) {
        fs.rmSync(path.join(ROOT, 'static/file', result.rows[0].scheduleFile));
      }
      res.json({
        complete: true
      });
    })('delete from teamScheduleFile where scheduleID=? and teamID=?', [
      scheduleID, teamID
    ])().catch(err => next(err));
  },
  Read(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const scheduleID = req.params?.scheduleID - 0;
    const teamID = req.params?.teamID - 0;
    const query = maria('query');
    query('select teamMember.userID is not null as isTeamMember from teamMember where teamMember.userID=? and teamMember.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows?.[0]?.isTeamMember) {
        throw new Error('403 권한 없음');
      }
    })('select teamScheduleFile.scheduleFile, teamScheduleFile.scheduleFileName from teamScheduleFile where teamScheduleFile.teamID=? and teamScheduleFile.scheduleID=?', [
      teamID, scheduleID
    ])(result => {
      if(!result.rows?.[0]?.scheduleFile) {
        throw new Error('404 파일 없음');
      }
      res.download(path.join(ROOT, 'static/file', result.rows[0].scheduleFile), result.rows[0].scheduleFileName);
    })().catch(err => next(err));
  },
  Update(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const scheduleID = req.params?.scheduleID - 0;
    const teamID = req.params?.teamID - 0;
    const query = maria('query');
    query('select teamSchedule.scheduleOwnerUserID=? as isScheduleOwn from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      userID, teamID, scheduleID
    ])(result => {
      // 권한 검사
      if(!result.rows?.[0]?.isScheduleOwn) {
        throw new Error('403 권한 없음');
      }
    })('select teamScheduleFile.scheduleFile from teamSchedule left join teamScheduleFile on teamSchedule.scheduleID=teamScheduleFile.scheduleID where teamSchedule.scheduleID=? and teamSchedule.teamID=?', [
      scheduleID, teamID
    ])(result => {
      // 파일 유무 검사
      if(result.rows?.[0]?.scheduleFile) {
        throw new Error('400 파일 존재함');
      }
      // TODO: 썸네일 제작 기능 추가해야 함
      return new Promise((resolve, reject) => {
        uploadFile(req, res, err => {
          if(err) {
            reject(err);
            return;
          }
          resolve({
            fileName: req?.file?.originalname,
            file: req?.file?.filename,
            path: req?.file?.path
          });
        });
      });
    })((result, storage) => {
      if(!storage?.file) {
        throw new Error('400 파일 없음');
      }
    })('insert into teamScheduleFile(scheduleFile,scheduleFileName, scheduleID, teamID) values(?, ?, ?, ?)', storage => ([
      storage.file, storage.fileName, scheduleID, teamID
    ]))((result, storage) => {
      if(!result.affectedRows) {
        fs.rmSync(storage.path);
        throw new Error();
      }
      res.json({
        complete: true,
        fileName: storage.fileName
      });
    })().catch(err => next(err));
  }
};
