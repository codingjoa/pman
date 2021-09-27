const maria = require('../server/database');
const { UnauthorizationError } = require('../server/Types/Error');

async function createSchedule(req, res) {
  const userID = req.user?.id;
  if(!userID) {
    throw new UnauthorizationError();
  }
  const teamID = req.params?.teamID;
  const schedulePublishAt = req.body?.schedulePublishAt;
  const scheduleExpiryAt = req.body?.scheduleExpiryAt;
  const scheduleContent = req.body?.scheduleContent;
  const scheduleName = req.body?.scheduleName;
  const scheduleTag = req.body?.scheduleTag ?? 0;
  if(teamID===undefined || schedulePublishAt===undefined || scheduleExpiryAt===undefined || scheduleContent===null || scheduleName===null) {
    throw new Error('param err');
  }

  const query = maria('query');
  query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
    userID, teamID
  ])(result => {
    if(!result.rows[0].isJoined) {
      throw new UnauthorizationError('권한 없음.')
    }
  })('insert into teamSchedule(scheduleOwnerUserID, scheduleName, schedulePublishAt, scheduleExpiryAt, scheduleContent, scheduleTag, teamID) values (?, ?, ?, ?, ?, ?, ?)', [
    userID, scheduleName, schedulePublishAt, scheduleExpiryAt, scheduleContent, scheduleTag, teamID
  ])(result => {
    if(!result.affectedRows) {
      throw new UnauthorizationError('권한 없음.');
    }
    const scheduleID = result.lastID;
    res.status(201);
    res.json({
      teamID,
      scheduleID
    });
  })

  await query();
}

module.exports = {
  Create(req, res, next) {
    createSchedule(req, res).catch(err => next(err));
  },
  Read(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID ?? null;
    const date = req.query?.date ?? null;
    const start = req.query?.start ?? null;
    const limit = req.query?.limit ?? null;
    if(teamID===null || start===null || limit===null) {
      new Error('param Err');
    }
    const query = maria('query');
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isJoined) {
        throw new UnauthorizationError('권한 없음.')
      }
    })('select count(*) as sizeAll from teamSchedule where teamSchedule.teamID=?', [
      teamID
    ])(result => {
      return {
        sizeAll: result.rows[0].sizeAll
      }
    })('select teamSchedule.scheduleName, user.userProfileName as scheduleOwnerUserName, teamSchedule.schedulePublishAt, teamSchedule.scheduleExpiryAt, teamSchedule.scheduleReversion, teamSchedule.scheduleTag, teamSchedule.scheduleContent from teamSchedule left join user on teamSchedule.scheduleOwnerUserID=user.userID where teamSchedule.teamID=? limit ?, ?', [
      teamID-0, start-0, limit-0
    ])((result, storage) => {
      if(!result.rows.length) {
        throw new UnauthorizationError('권한 없음.')
      }
      res.json({
        fetchOption: {
          teamID,
          date
        },
        fetchResult: {
          sizeAll: storage.sizeAll,
          schedules: result.rows
        }
      });
    })().catch(err => next(err));
  }
};
