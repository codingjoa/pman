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
          throw new TeamScheduleFileDAO.Error404();
        }
        this.download(res, files[0]);
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
  app.middlewares(TeamScheduleFileDAO.uploadFileExecute);
}
