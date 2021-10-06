const TeamDAO = require('../dao');

class TeamDetailDAO extends TeamDAO {
  async read(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 읽기 권한 확인
    this.checkReadPermissions();

    // 본 작업
    return this.query(
`select
  team.teamProfileName,
  user.userProfileName as teamOwnerUserName,
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
    ])(result => {
      return {
        teamOwnerUserName: result.rows[0].teamOwnerUserName,
        teamOwnerUserImg: result.rows[0].teamOwnerUserImg,
        teamProfileName: result.rows[0].teamProfileName
      }
    })(
`select
  teamMember.userID,
  user.userProfileName,
  case user.userProfileImg is null
    when 1
    then user.userProfileImgDefault
    else user.userProfileImg
  end as userProfileImg
from
  team left join teamMember on
    team.teamID=teamMember.teamID left join
  user on
    teamMember.userID=user.userID
where
  team.teamID=?`, [
      this.teamID
    ])((result, storage) => {
      res.json({
        ...storage,
        users: result.rows
      });
    })();
  }
}
module.exports = TeamDetailDAO;
