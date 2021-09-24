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
      // count를 사용한 쿼리인 탓에 무조건 rows가 나옵니다.
      // 존재하지 않는 팀인지 알 수 없도록 무조건 권한 없음을 표시
      if(!result.rows[0].isJoined) {
        throw new UnauthorizationError('권한 없음.');
      }
      return {
        teamProfileName: result.rows[0].teamProfileName
      }
    })('select teamMember.userID, user.userProfileName, user.userProfileImg, user.userProfileImgDefault from team left join teamMember on team.teamID=teamMember.teamID left join user on teamMember.userID=user.userID where team.teamID=?', [
      teamID
    ])((result, storage) => {
      res.json({
        ...storage,
        users: result.rows
      });
    })().catch(err => next(err));
  }
}
