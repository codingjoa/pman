const maria = require('../server/database');
const env = require('../server/environment');
const jwt = require('jsonwebtoken');
const iss = 'development';
const { NotFoundError, UnauthorizationError } = require('../server/Types/Error');

function createInviteToken(teamID, teamInviteCount) {
  //team.teamInviteCount
  // 24시간동안 유효한 토큰 발급
  const iat = Date.now() / 1000;
  const payload = {
    iss,
    iat,
    exp: iat + 86400,
    id: teamID,
    count: teamInviteCount
  };
  const token = jwt.sign(payload, 'development', {
    algorithm: 'HS256'
  });
  return token;
}
function validateInviteToken(token, teamInviteCount) {
  const payload = jwt.verify(token, 'development', {
    algorithms: ['HS256']
  });
  return {
    teamID: payload.id,
    teamInviteCount: payload.count
  }
}

module.exports = {
  Read(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const inviteToken = req.query?.token;
    const query = maria('query');
    const { teamID, teamInviteCount } = validateInviteToken(inviteToken);
    query('select team.teamInviteCount, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].teamInviteCount === null ) {
        throw new NotFoundError('존재하지 않는 팀입니다.');
      }
      if(teamInviteCount !== result.rows[0].teamInviteCount) {
        throw new Error('old token');
      }
      if(result.rows[0].isJoined) {
        throw new Error('이미 팀에 소속되어 있음.');
      }
    })('insert into teamMember (userID, teamID) values (?, ?)', [
      userID, teamID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('적용되지 않음');
      }
      res.json({
        redirectURL: new URL(`/team/${teamID}`, env.FRONT_DOMAIN).href
      });
    })().catch(err => next(err));
  },
  Create(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.body?.teamID;
    if(!teamID) {
      throw new Error('param err');
    }
    const query = maria('query');
    query('select team.teamInviteCount from team where team.teamID=?', [
      teamID
    ])(result => {
      if(!result.rows.length) {
        throw new NotFoundError('존재하지 않는 팀입니다.');
      }
      return {
        teamInviteCount: result.rows[0].teamInviteCount
      };
    })('update team set team.teamInviteCount=team.teamInviteCount+1, team.teamInviteLatestAt=current_timestamp where team.teamID=?', [
      teamID
    ])((result, storage) => {
      if(!result.affectedRows) {
        throw new Error('적용되지 않음');
      }
      const teamInviteCount = storage.teamInviteCount;
      const inviteToken = createInviteToken(teamID, teamInviteCount + 1);
      res.status(201);
      res.json({
        intiveToken: inviteToken,
        intiveURL: new URL(`/invite?token=${inviteToken}`, env.FRONT_DOMAIN).href
      });
    })().catch(err => next(err));
  }
}
