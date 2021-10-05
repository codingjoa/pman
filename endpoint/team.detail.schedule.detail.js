const maria = require('../loadModules').maria;
const permissions = require('./permissions');
const { UnauthorizationError } = require('../loadModules').Error;

module.exports = {
  Delete(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID - 0;
    const scheduleID = req.params?.scheduleID - 0;
    if(teamID===NaN || scheduleID===NaN) {
      throw new Error('400 파라미터 오류');
    }

    const query = maria('query');
    query('select teamMember.teamPermission, team.teamOwnerUserID=? as isTeamOwn from team left join teamMember on team.teamID=teamMember.teamID where teamMember.teamID=? and teamMember.userID=?', [
      userID, teamID, userID
    ])(result => result.rows?.[0])('select teamSchedule.scheduleOwnerUserID=? as isScheduleOwn from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      userID, teamID, scheduleID
    ])((result, storage) => {
      if(result.rows?.[0]?.isScheduleOwn) {
        return;
      }
      if(result.rows?.[0]?.isTeamOwn) {
        return;
      }
      if(storage.teamPermission & permissions.SCHEDULE_MANAGEMENT) {
        return;
      }
      throw new Error('403 권한 없음');
    })('delete from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      teamID, scheduleID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        scheduleID,
        complete: true
      });
    })().catch(err => next(err));
  },
  Patch(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID - 0;
    const scheduleID = req.params?.scheduleID - 0;
    if(teamID === NaN || scheduleID === NaN) {
      throw new Error('param err');
    }
    const addRefUsers = req.body?.addRefUsers ?? [];
    const deleteRefUsers = req.body?.deleteRefUsers ?? [];
    const schedulePublishAt = req.body?.schedulePublishAt;
    const scheduleExpiryAt = req.body?.scheduleExpiryAt;
    const scheduleName = req.body?.scheduleName;
    const scheduleContent = req.body?.scheduleContent;
    const scheduleTag = req.body?.scheduleTag;

    const query = maria('query');
    query('select teamSchedule.scheduleOwnerUserID=? as isScheduleOwn from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      userID, teamID, scheduleID
    ])(result => {
      // 권한 검사
      if(!result.rows?.[0]?.isScheduleOwn) {
        throw new Error('403 권한 없음');
      }
    });

    if(schedulePublishAt !== undefined) {
      query('update teamSchedule set teamSchedule.schedulePublishAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        schedulePublishAt, teamID, scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(scheduleExpiryAt !== undefined) {
      query('update teamSchedule set teamSchedule.scheduleExpiryAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        scheduleExpiryAt, teamID, scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(scheduleName !== undefined) {
      query('update teamSchedule set teamSchedule.scheduleName=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        scheduleName, teamID, scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(scheduleContent !== undefined) {
      query('update teamSchedule set teamSchedule.scheduleContent=?, teamSchedule.scheduleReversion=teamSchedule.scheduleReversion+1 where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        scheduleContent, teamID, scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
        return {
          scheduleReversion: true
        }
      });
    }
    if(scheduleTag !== undefined) {
      query('update teamSchedule set teamSchedule.scheduleTag=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        scheduleTag, teamID, scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(addRefUsers.length) {
      for(const refUserID of addRefUsers) {
        query('select count(teamScheduleReference.userID=?)>0 as isRegCode from teamScheduleReference where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=?', [
          refUserID, teamID, scheduleID
        ])(result => {
          if(result.rows[0].isRegCode) {
            throw new Error();
          }
        })('insert into teamScheduleReference(scheduleID, userID, teamID) values (?, ?, ?)', [
          scheduleID, refUserID, teamID
        ])(result => {
          if(!result.affectedRows) {
            throw new new Error();
          }
        });
      }
    }
    if(deleteRefUsers.length) {
      for(const refUserID of deleteRefUsers) {
        query('delete from teamScheduleReference where teamScheduleReference.scheduleID=? and teamScheduleReference.userID=? and teamScheduleReference.teamID=?', [
          scheduleID, refUserID, teamID
        ])(result => {
          if(!result.affectedRows) {
            throw new new Error();
          }
        });
      }
    }

    query((_, storage) => {
      res.json({
        scheduleID,
        scheduleReversion: storage?.scheduleReversion ?? false
      });
    })().catch(err => next(err));
  },
  Read(req, res, next) {
    const userID = req.user?.id - 0;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID - 0;
    const scheduleID = req.params?.scheduleID - 0;
    if(teamID===NaN || scheduleID===NaN) {
      new Error('400 파라미터 오류');
    }
    const query = maria('query');
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isTeamMember from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isTeamMember) {
        throw new Error('403 권한 없음.');
      }
    })('select teamScheduleReference.scheduleReferenceID, teamScheduleReference.userID, user.userProfileName, case user.userProfileImg is null when 1 then user.userProfileImgDefault else user.userProfileImg end as userProfileImg, teamScheduleReference.scheduleReferencePublishAt, teamScheduleReference.scheduleReferenceTag, CHAR_LENGTH(teamScheduleReference.scheduleReferenceContent) as scheduleReferenceContentSize from teamScheduleReference left join user on teamScheduleReference.userID=user.userID where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=?', [
      teamID, scheduleID
    ])(result => {
      return {
        scheduleReferences: result.rows
      };
    })('select teamScheduleFile.scheduleFile from teamScheduleFile where teamScheduleFile.scheduleID=?', [
      scheduleID
    ])(result => {
      return {
        scheduleFiles: result.rows
      };
    })('select teamSchedule.scheduleName, user.userProfileName as scheduleOwnerUserName, teamSchedule.schedulePublishAt, teamSchedule.scheduleExpiryAt, teamSchedule.scheduleReversion, teamSchedule.scheduleTag, teamSchedule.scheduleContent from teamSchedule left join user on teamSchedule.scheduleOwnerUserID=user.userID where teamSchedule.teamID=? and teamSchedule.scheduleID=? ', [
      teamID, scheduleID
    ])((result, storage) => {
      if(!result.rows.length) {
        throw new Error('403 권한 없음.');
      }
      res.json({
        ...result.rows[0],
        scheduleReferences: storage.scheduleReferences,
        scheduleFiles: storage.scheduleFiles,
        teamID,
        scheduleID
      });
    })().catch(err => next(err));
  }
};
