const DAO = require('../dao');
class TeamDAO extends DAO {
  constructor(req) {
    super(req);
    this.teamID = req.params?.teamID - 0;

    this.teamProfileName = req.body?.teamProfileName;
    this.teamProfileDescription = req.body?.teamProfileDescription;
  }
/*
  isTeamMember() {

    this.query('')
    return this;
  }
*/
  async createTeam(res) {
    if(!this.teamProfileName || !this.teamProfileDescription) {
      throw new Error('401 파라미터 오류');
    }

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

  async getTeams(res) {
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
