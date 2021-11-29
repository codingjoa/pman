module.exports = (app, TeamScheduleDetailModel) => {
  class TeamScheduleStatusModel extends TeamScheduleDetailModel {
    constructor(req) {
      super(req);
      this.statusContent = req.body?.statusContent ?? '';
      this.statusContent = this.statusContent.replace(/\n/gi, ' ');
      this.useFilesystem(req.file, '/static/file');
    }

    async checkStatusExist(db) {
      const status = await db.get('select count(*)>0 as isExist from teamScheduleStatus where teamScheduleStatus.teamID=? and teamScheduleStatus.scheduleID=? and teamScheduleStatus.userID=?', [
        this.teamID, this.scheduleID, this.requestUserID
      ]);
      return !! status[0].isExist;
    }

    async checkCreatePermissions(db) {
      if(!await this.checkScheduleMember(db)) {
        throw new TeamScheduleStatusModel.Error403();
      }
      if(!await this.checkScheduleAvailable(db)) {
        throw new TeamScheduleStatusModel.Error400('SCHEDULE_EXPIRED');
      }
      if(await this.checkStatusExist(db)) {
        throw new TeamScheduleStatusModel.Error400('SCHEDULE_EXISTS');
      }
    }

    async create(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
        this.statusContent,
      );
      await this.dao.serialize(async db => {
        await this.checkCreatePermissions(db);
        let fileName = null;
        let fileUUID = null;
        await this.file.add(async file => {
          fileUUID = file.uuid;
          fileName = file.name;
        }, { force: true });
        if(fileUUID !== null) {
          await db.run('insert into teamFiles (fileUUID, fileName) values (?, ?)', [
            fileUUID, fileName
          ]);
        }
        const result = await db.run(`insert into teamScheduleStatus(
            teamID,
            scheduleID,
            userID,
            statusContent,
            fileUUID
          ) values (
            ?,
            ?,
            ?,
            ?,
            ?
          )`, [
          this.teamID, this.scheduleID, this.requestUserID, this.statusContent, fileUUID
        ]);
        if(!result.affectedRows) {
          throw new TeamScheduleStatusModel.Error403();
        }
        res.json({
          complete: true
        });
      }).catch(err => {
        this?.file?.withdraw && this.file.withdraw();
        throw err;
      });

      this.publishWebhook(this.scheduleID, `[작업 완료/#${this.scheduleID}] ${this.statusContent}`);
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
      );
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const status = await db.get(`select
          user.userProfileName as userProfileName,
          user.userProfileImg as userProfileImg,
          teamScheduleStatus.createdAt,
          teamScheduleStatus.statusContent,
          teamFiles.fileName
        from
          teamScheduleStatus left join
          user on
            teamScheduleStatus.userID=user.userID left join
          teamFiles on
            teamScheduleStatus.fileUUID=teamFiles.fileUUID
        where
          teamScheduleStatus.teamID=? and
          teamScheduleStatus.scheduleID=?`, [
          this.teamID, this.scheduleID, this.requestUserID
        ]);
        if(!status[0]) {
          throw new TeamScheduleStatusModel.Error404();
        }
        res.json({
          _meta: null,
          ...status[0],
        });
      });
    }

    async checkDeletePermissions(db) {
      if(!await this.checkScheduleMember(db)) {
        throw new TeamScheduleStatusModel.Error403();
      }
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
      );
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        const file = await db.get(`select
          teamFiles.fileUUID
        from
          teamScheduleStatus left join
          teamFiles on
            teamScheduleStatus.fileUUID=teamFiles.fileUUID
        where
          teamScheduleStatus.teamID=? and
          teamScheduleStatus.scheduleID=? and
          teamScheduleStatus.userID=?`, [
          this.teamID, this.scheduleID, this.requestUserID
        ]);
        if(file[0]?.fileUUID) {
          await db.run('delete from teamFiles where teamFiles.fileUUID=?', [
            file[0].fileUUID
          ]);
          await this.file.del(async remover => {
            remover(file[0].fileUUID, { nameOnly: true });
          });
        }
        await db.run('delete from teamScheduleStatus where teamScheduleStatus.teamID=? and teamScheduleStatus.scheduleID=? and teamScheduleStatus.userID=?', [
          this.teamID, this.scheduleID, this.requestUserID
        ]);
        res.json({
          complete: true
        });
      });
    }
  }
  app(TeamScheduleStatusModel);
  app.create();
  app.read();
  app.delete();
  app.middlewares(TeamScheduleStatusModel.uploadFileExecute);
  app.child('/file', require('./file'));
}
