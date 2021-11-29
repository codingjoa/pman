module.exports = (app, StatusFileModel) => {
  class StatusUserFileModel extends StatusFileModel {
    constructor(req) {
      super(req);
      this.userID = req.params.userID;
    }
    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.scheduleID, this.teamID, this.userID);
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
          this.teamID, this.scheduleID, this.userID
        ]);
        if(!files[0]?.fileUUID) {
          throw new StatusFileModel.Error404();
        }
        this.download(res, files[0]);
      });
    }
  }
  app(StatusUserFileModel);
  app.read();
}
