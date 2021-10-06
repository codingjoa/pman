const TeamDAO = require('../dao');
const permissions = require('./permissions');
class TeamUserDAO extends TeamDAO {
  constructor(req) {
    super(req);

    if(req.params?.userID === 'me') {
      this.userID = this.requestUserID;
    } else {
      this.userID = req.params?.userID - 0;
    }
  }

  checkDeletePermissions() {
    if(this.userID === this.requestUserID) {
      return;
    } else {
      this.isTeamPermissions();
      this.query((result, storage) => {
        if(storage.isTeamOwner ? true : (storage.isTeamPermission & permissions.USER_MANAGEMENT)) {
          return;
        }
        throw new Error('403 권한 없음');
      });
    }
  }

  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(this.teamID, this.userID);
    return this.query(
`delete from
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
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        userID
      });
    })();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(this.teamID);
    return this.query('select teamMember.userID, user.userProfileName, user.userProfileImg, user.userProfileImgDefault from team left join teamMember on team.teamID=teamMember.teamID left join user on teamMember.userID=user.userID where team.teamID=?', [
      this.teamID
    ])(result => {
      res.json({
        users: result.rows
      });
    })();
  }
}
module.exports = TeamUserDAO;
