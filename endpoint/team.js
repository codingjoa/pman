const maria = require('../server/database');
const { NotFoundError, UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Read(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    maria('query')('select team.teamID, team.teamCreatedAt, team.teamProfileName, team.teamProfileImg, case team.teamOwnerUserID when teamMember.userID then 1 else 0 end as isOwn from team left join teamMember on team.teamID=teamMember.teamID where teamMember.userID=?', [
      userID
    ])(result => {
      if(result.rows.length) {
        const profile = result.rows[0];
        res.json({
          teams: result.rows
        });
      } else {
        throw new NotFoundError('존재하지 않는 그룹입니다.');
      }
    })().catch(err => next(err));
  },
  Create(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    console.log(req.body);
    const teamProfileName = req.body?.teamProfileName;
    const teamProfileDescription = req.body?.teamProfileDescription;
    if(!teamProfileName || !teamProfileDescription) {
      throw new Error('param Error');
    }
    const query = maria('query');
    query('insert into team(teamOwnerUserID, teamProfileName, teamProfileDescription) values (?, ?, ?)', [
      userID, teamProfileName, teamProfileDescription
    ])(result => {
      return {
        teamID: result.lastID
      };
    })('insert into teamMember(teamID, userID) values (LAST_INSERT_ID(), ?)', [
      userID
    ])((result, storage) => {
      const teamID = storage.teamID;
      res.status(201);
      res.json({
        teamID
      });
    })().catch(err => next(err));
  },
  Delete(req, res, next) {

  }
}
