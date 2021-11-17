module.exports = (app, TeamModel) => {
  class TeamDetailModel extends TeamModel {

    async checkTeamMember(db) {
      const result = await db.get(`select
        team.teamProfileName,
        count(teamMember.userID=?)>0 as isTeamMember
      from
        team left join teamMember on
          team.teamID=teamMember.teamID
      where
        team.teamID=?`, [
        this.requestUserID, this.teamID
      ]);
      return result[0]?.isTeamMember===1
    }

    async checkTeamOwned(db) {
      const result = await db.get(`select
        team.teamOwnerUserID=? as isTeamOwner,
        teamMember.teamPermission
      from
        team left join
        teamMember on
          team.teamID=teamMember.teamID
      where
        teamMember.userID=? and
        teamMember.teamID=?`, [
        this.requestUserID, this.requestUserID, this.teamID
      ]);
      return result[0].isTeamOwner===1;// || result[0].teamPermission
    }

    async renameTeam(db) {
      const result = await db.run('update team set teamProfileName=? where team.yeamID=?', [
        this.teamProfileName, this.teamID
      ]);
      return !!result.affectedRows;
    }

    async checkReadPermissions(db) {
      if(await this.checkTeamMember(db)) {
        return;
      }
      throw new Error('403 권한 없음');
    }

    async read(res) {
      this.isAuthorized();
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const teams = await db.get(`select
          team.teamProfileName,
          user.userProfileName as teamOwnerUserName,
          team.teamProfileDescription,
          case user.userProfileImg is null
            when 1
            then user.userProfileImgDefault
            else user.userProfileImg
          end as teamOwnerUserImg
        from
          team left join teamMember on
            team.teamID=teamMember.teamID left join
          user on
            team.teamOwnerUserID=user.userID
        where
          team.teamID=?`, [
          this.teamID
        ]);
        const users = await db.get(`select
          teamMember.userID,
          user.userProfileName,
          case user.userProfileImg is null
            when 1
            then user.userProfileImgDefault
            else user.userProfileImg
          end as userProfileImg,
          teamMember.userID=team.teamOwnerUserID as isOwner
        from
          team left join teamMember on
            team.teamID=teamMember.teamID left join
          user on
            teamMember.userID=user.userID
        where
          team.teamID=?`, [
          this.teamID
        ]);
        res.json({
          ...teams[0],
          users
        });
      });
    }

    async checkUpdatePermissions(db) {
      if(await this.checkTeamOwned(db)) {
        return;
      }
      throw new Error('403 권한 없음');
    }

    async update(res) {
      this.isAuthorized();
      this.checkParameters(this.teamName, this.teamID);
      await this.dao.serialize(async db => {
        await this.checkUpdatePermissions(db);
        if(! await this.renameTeam(db)) {
          throw new TeamModel.Error403();
        };
        res.json({
          complete: true
        });
      });
    }
  }
  app(TeamDetailModel);
  app.read();
  app.update();
  app.child('/schedule', require('./schedule'));
  app.child('/invite', require('./invite'));
  app.child('/user/:userID', require('./user'));
}
