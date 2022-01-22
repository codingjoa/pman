const FRONT_DOMAIN = process.env.FRONT_DOMAIN ?? 'localhost';
module.exports = (app, TeamModel) => {
  class TeamInvite extends TeamModel {
    constructor(req) {
      super(req);
      if(req.query?.token) {
        const { id: teamID, count: teamInviteCount } = this.jwt.validateJWT(req.query.token);
        this.teamID = teamID;
        this.teamInviteCount = teamInviteCount;
      }
    }

    async checkReadPermissions(db) {
      if(await this.checkTeamMember(db)) {
        throw new TeamInvite.Error400('USER_EXISTS');
      }
      const teams = await db.get('select team.teamInviteCount, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
        this.requestUserID, this.teamID
      ]);
      if(!teams[0] || this.teamInviteCount !== teams[0].teamInviteCount) {
        throw new TeamInvite.Error403();
      }
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.teamInviteCount);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const result = await db.run('insert into teamMember (userID, teamID) values (?, ?)', [
          this.requestUserID, this.teamID
        ]);
        if(!result.affectedRows) {
          throw new TeamInvite.Error500('DB_ERROR');
        }
        res.json({
          redirectURL: new URL(`/team/${this.teamID}`, FRONT_DOMAIN).href
        });
      });
    }
  }
  app(TeamInvite);
  app.read();
}
