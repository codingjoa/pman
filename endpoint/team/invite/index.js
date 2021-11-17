const path = require('path');
const ROOT = process.cwd();
const env = require(path.join(ROOT, '/loadModules.js')).env;
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
      if(await this.isTeamMember()) {
        throw new Error('400 이미 소속된 팀');
      }
      const teams = await db.get('select team.teamInviteCount, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
        this.requestUserID, this.teamID
      ]);
      if(!teams[0] || this.teamInviteCount !== teams[0].teamInviteCount) {
        throw new Error('403 권한 없음');
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
          throw new Error('적용되지 않음');
        }
        res.json({
          redirectURL: new URL(`/team/${this.teamID}`, env.FRONT_DOMAIN).href
        });
      });
    }
  }
  app(TeamInvite);
  app.read();
}
