const DAO = require('../dao');
class TeamDAO extends DAO {
  constructor(req) {
    super(req);
    this.teamID = req.params?.teamID - 0;

    this.teamProfileName = req.body?.teamProfileName;
    this.teamProfileDescription = req.body?.teamProfileDescription;
  }

  isTeamMember() {
    this.query(
`select
  team.teamProfileName,
  count(teamMember.userID=?)>0 as isTeamMember
from
  team left join teamMember on
    team.teamID=teamMember.teamID
where
  team.teamID=?`, [
      this.requestUserID, this.teamID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isTeamMember: p?.isTeamMember
      };
    });
  }

  isTeamPermissions() {
    this.query(
`select
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
    ])(result => {
      const p = result.rows?.[0];
      return {
        isTeamOwner: p?.isTeamOwner,
        isTeamPermissions: p?.isTeamMember
      };
    });
  }

  checkReadPermissions() {
    this.isTeamMember();
    this.query((result, storage) => {
      if(!storage.isTeamMember) {
        throw new Error('403 권한 없음');
      }
    });
    return this;
  }

  async create(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 본 작업
    this.checkParameters(this.teamProfileName, this.teamProfileDescription);
    return this.query('insert into team(teamOwnerUserID, teamProfileName, teamProfileDescription) values (?, ?, ?)', [
      this.requestUserID, this.teamProfileName, this.teamProfileDescription
    ])(result => {
      return {
        teamID: result.lastID
      };
    })('insert into teamMember(teamID, userID) values (LAST_INSERT_ID(), ?)', [
      this.requestUserID
    ])((result, storage) => {
      const teamID = storage.teamID;
      res.status(201);
      res.json({
        teamID
      });
    })();
  }

  async read(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 본 작업
    return this.query(
`select
  team.teamID,
  team.teamCreatedAt,
  team.teamProfileName,
  team.teamProfileImg,
  case team.teamOwnerUserID
    when teamMember.userID
    then 1
    else 0
  end as isOwn
from
  team left join teamMember on
    team.teamID=teamMember.teamID
where
  teamMember.userID=?`, [
      this.requestUserID
    ])(result => {
      res.json(result.rows);
    })();
  }
}
module.exports = TeamDAO;
