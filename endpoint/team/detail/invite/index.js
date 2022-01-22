const FRONT_DOMAIN = process.env.FRONT_DOMAIN ?? 'localhost';
module.exports = (app, TeamDetailModel) => {
  class TeamInviteCreate extends TeamDetailModel {
    async checkCreatePermissions(db) {
      if(await this.checkTeamOwned(db)) {
        return;
      }
      throw new TeamInviteCreate.Error403();
    }

    async create(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID);
      await this.dao.serialize(async db => {
        await this.checkCreatePermissions(db);
        const teams = await db.get(`select
          team.teamInviteCount
        from
          team
        where
          team.teamID=?`, [
          this.teamID
        ]);
        // invite count 증가
        await db.run(`update
          team
        set
          team.teamInviteCount=team.teamInviteCount+1,
          team.teamInviteLatestAt=current_timestamp
        where
          team.teamID=?`, [
          this.teamID
        ]);
        const teamInviteCount = teams[0].teamInviteCount;
        const inviteToken = this.jwt.createJWT({
          id: this.teamID,
          count: teamInviteCount + 1,
        }, 86400);
        res.status(201);
        res.json({
          inviteToken,
          inviteCount: teamInviteCount,
          inviteURL: new URL(`/invite?token=${inviteToken}`, FRONT_DOMAIN).href,
        });
      });
    }
  }
  app(TeamInviteCreate);
  app.create();
}
