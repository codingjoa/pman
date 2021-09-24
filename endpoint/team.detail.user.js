const maria = require('../server/database');
const { UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Read(req, res, next) {
    const userID = req.user?.id;
    const teamID = req.params?.teamID;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const query = maria('query');
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isJoined) {
        throw new UnauthorizationError('권한 없음.');
      }
    })('select teamMember.userID, user.userProfileName, user.userProfileImg, user.userProfileImgDefault from team left join teamMember on team.teamID=teamMember.teamID left join user on teamMember.userID=user.userID where team.teamID=?', [
      teamID
    ])(result => {
      res.json({
        users: result.rows
      });
    })().catch(err => next(err));
  },
  Delete(req, res, next) {
    const requestUserID = req.user?.id;
    const userID = (req.params?.userID) ? req.params.userID - 0 : null;
    const teamID = req.params?.teamID;
    if(!requestUserID) {
      throw new UnauthorizationError();
    }
    const query = maria('query');
    query('select team.teamOwnerUserID from team where team.teamID=?', [
      teamID
    ])(result => {
      if(!result.rows.length) {
        throw new UnauthorizationError('권한 없음.');
      }
      const teamOwnerUserID = result.rows[0].teamOwnerUserID;
      if(teamOwnerUserID === userID) {
        // 팀 오너는 삭제 불가
        throw new UnauthorizationError('권한 없음.');
      }
      if(teamOwnerUserID !== requestUserID && userID !== requestUserID) {
        // 관리자가 아닌 사람은 자기 자신만 삭제 가능
        throw new UnauthorizationError('권한 없음.');
      }
    })('delete from teamMember where teamMember.teamID=? and teamMember.userID=?', [
        teamID, userID
    ])(() => {
      res.json({
        userID
      });
    })().catch(err => next(err));
  }
};
