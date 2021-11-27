module.exports = (app, TeamDetailModel) => {
  class TeamWebhookModel extends TeamDetailModel {
    constructor(req) {
      super(req);
      this.webhookURL = req.body?.webhookURL;
    }
    async checkUpdatePermission(db) {
      if(await this.checkTeamOwned(db)) {
        return;
      }
      throw new TeamWebhookModel.Error403();
    }
    async update(res) {
      this.isAuthorized();
      this.checkParameters(this.webhookURL, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkUpdatePermission(db);
        if(this.webhookURL === '') {
          await db.run('delete from teamWebhook where teamWebhook.teamID=?', [
            this.teamID
          ]);
        } else {
          const exists = await db.get('select count(*) as isExists from teamWebhook where teamWebhook.teamID=?', [
            this.teamID
          ]);
          if(!exists[0].isExists) {
            await db.run('insert into teamWebhook (webhookURL, teamID) values (?, ?)', [
              this.webhookURL, this.teamID
            ]);
          } else {
            await db.run('update teamWebhook set teamWebhook.webhookURL=? where teamWebhook.teamID=?', [
              this.webhookURL, this.teamID
            ]);
          }
        }

        res.json({
          complete: true,
        });
      });
    }

  }
  app(TeamWebhookModel);
  app.update();
}
