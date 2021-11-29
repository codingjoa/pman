module.exports = (app, TeamScheduleStatusModel) => {
  class StatusFileModel extends TeamScheduleStatusModel {
    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.scheduleID, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const files = await db.get(`select
          teamFiles.fileUUID,
          teamFiles.fileName
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
        if(!files[0]?.fileUUID) {
          throw new StatusFileModel.Error404();
        }
        this.download(res, files[0]);
      });
    }
  }
  app(StatusFileModel);
  app.read();
  app.child('/:userID', require('./detail'));
}
