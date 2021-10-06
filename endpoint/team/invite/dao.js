const TeamDAO = require('../dao');
const permissions = require('./permissions');

const path = require('path');
const ROOT = process.cwd();
const env = require(path.join(ROOT, '/loadModules.js')).env;
const jwt = require('jsonwebtoken');
const iss = 'development';
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

class TeamInviteDao extends TeamDAO {
  constructor(req) {
    super(req);
    if(req.query?.token) {
      const payload = validateInviteToken(req.query.token);
      this.teamID = payload.teamID;
      this.teamInviteCount = payload.teamInviteCount;
    }
  }

  checkCreatePermissions() {
    this.isTeamPermissions();
    this.query((result, storage) => {
      if(storage.isTeamOwner) {
        return;
      }
      if(storage.isTeamPermission & permissions.INVITE_MANAGEMENT) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }

  checkReadPermissions() {
    this.isTeamMember();
    this.checkParameters(this.teamInviteCount);
    this.query('select team.teamInviteCount, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      this.requestUserID, this.teamID
    ])((result, storage) => {
      const p = result.rows?.[0];
      if(!p) {
        throw new Error('403 권한 없음');
      }
      if(this.teamInviteCount !== p.teamInviteCount) {
        throw new Error('403 권한 없음');
      }
      if(storage.isTeamMember) {
        throw new Error('400 이미 소속된 팀');
      }
    });
  }

  async create(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 쓰기 권한 확인
    this.checkCreatePermissions();

    // 본 작업
    this.checkParameters(this.teamID);
    return this.query(
`select
  team.teamInviteCount
from
  team
where
  team.teamID=?`, [
      this.teamID
    ])(result => {
      const p = result.rows?.[0];
      return {
        teamInviteCount: p?.teamInviteCount
      };
    })(
`update
  team
set
  team.teamInviteCount=team.teamInviteCount+1,
  team.teamInviteLatestAt=current_timestamp
where
  team.teamID=?`, [
      this.teamID
    ])((result, storage) => {
      if(!result.affectedRows) {
        throw new Error('적용되지 않음');
      }
      const teamInviteCount = storage.teamInviteCount;
      const inviteToken = createInviteToken(this.teamID, teamInviteCount + 1);
      res.status(201);
      res.json({
        intiveToken: inviteToken,
        intiveURL: new URL(`/invite?token=${inviteToken}`, env.FRONT_DOMAIN).href
      });
    })();
  }

  async read(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 읽기 권한 확인
    this.checkReadPermissions();

    // 본 작업
    this.checkParameters(this.teamID);
    return this.query('insert into teamMember (userID, teamID) values (?, ?)', [
      this.requestUserID, this.teamID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('적용되지 않음');
      }
      res.json({
        redirectURL: new URL(`/team/${this.teamID}`, env.FRONT_DOMAIN).href
      });
    })();
  }
}
module.exports = TeamInviteDao;
