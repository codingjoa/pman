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

module.exports = (app, TeamScheduleDetailDAO) => {
  class TeamScheduleFileDAO extends TeamScheduleDetailDAO {
    constructor(req) {
      super(req);
      this.useFilesystem(req.file, '/static/file');
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(this.scheduleID, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        const files = await db.get(`select
          teamFiles.fileUUID
        from
          teamSchedule left join
          teamFiles on
            teamSchedule.fileUUID=teamFiles.fileUUID
        where
          teamSchedule.scheduleID=? and
          teamSchedule.teamID=?`, [
          this.scheduleID, this.teamID
        ]);
        if(!files[0].fileUUID) {
          return;
        }
        await this.file.del(rm => {
          rm(files[0].fileUUID, { nameOnly: true });
        });
        await db.run('delete from teamFiles where fileUUID=?', [
          files[0].fileUUID
        ]);
        res.json({
          complete: true
        });
      });
    }

  /*
        if(p?.fileUUID) {
          fs.rmSync(path.join(ROOT, 'static/file', p.fileUUID), { force: true });
        }

        return { fileUUID: p.fileUUID };*/

    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.scheduleID, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const files = await db.get(`select
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
        ]);
        if(!files[0]?.fileUUID) {
          throw new Error('404 파일 없음');
        }
        res.download(path.join(ROOT, 'static/file', files[0].fileUUID), files[0].fileName);
      });
    }

    async update(res) {
      this.isAuthorized();
      this.checkParameters(this.scheduleID, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkUpdatePermissions(db);
        const files = await db.get(`select
          teamFiles.fileUUID
        from
          teamSchedule left join
          teamFiles on
            teamSchedule.fileUUID=teamFiles.fileUUID
        where
          teamSchedule.scheduleID=? and
          teamSchedule.teamID=?`, [
          this.scheduleID, this.teamID
        ]);
        await this.file.add(async file => {
          if(files[0]?.fileUUID) {
            throw new Error('404 파일 존재함');
          }
          await db.run('insert into teamFiles(fileUUID, fileName) values(?, ?)', [
            file.uuid, file.name
          ]);
          const result = await db.run('update teamSchedule set teamSchedule.fileUUID=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            file.uuid, this.teamID, this.scheduleID
          ]);
          if(!result.affectedRows) {
            throw new Error('500 업로드 실패');
          }
          res.json({
            complete: true
          });
        });
      });
    }
  }
  app(TeamScheduleFileDAO);
  app.read();
  app.update();
  app.delete();
  app.middlewares(uploadFileExecute);
}
