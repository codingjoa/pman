module.exports = (app, TeamDetailModel) => {
  class TeamUserModel extends TeamDetailModel {
    constructor(req) {
      super(req);
      if(req.params?.userID === 'me') {
        this.userID = this.requestUserID;
      } else {
        this.userID = req.params?.userID - 0;
      }
    }

    async checkDeletePermissions(db) {
      if(this.userID === this.requestUserID) {
        if(await this.checkTeamOwned(db)) {
          throw new TeamUserModel.Error403();
          // 관리자는 나갈 수 없음.
        }
        // 자기 자신은 일반유저일 때
      } else {
        if(!await this.checkTeamOwned(db)) {
          throw new TeamUserModel.Error403();
        }
      }
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.userID);
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        await db.run(`delete from
          teamMember
        where
          teamMember.teamID=? and
          teamMember.userID=? and
          teamMember.userID!=(
            select
              team.teamOwnerUserID
            from
              team
            where
              team.teamID=?
          )`, [
          this.teamID, this.userID, this.teamID
        ]);
        if(!result.affectedRows) {
          throw new TeamUserModel.Error403();
        }
        res.json({
          complete: true
        });
      });
    }
  }
  app(TeamUserModel);
  app.delete();
}
