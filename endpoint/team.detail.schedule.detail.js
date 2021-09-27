const maria = require('../server/database');
const { UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Delete(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID;
    const scheduleID = req.params?.scheduleID;
    if(!teamID || !scheduleID) {
      throw new Error('param err');
    }

    const query = maria('query');
    query(result => {
      if(!result.affectedRows) {
        throw new UnauthorizationError('권한 없음.');
      }
      res.json({
        scheduleID
      });
    })().catch(err => next(err));
  },
  Patch(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID;
    const scheduleID = req.params?.scheduleID;
    if(!teamID || !scheduleID) {
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
    query('select teamSchedule.scheduleOwnerUserID=? as isOwn from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      userID, teamID, scheduleID
    ])(result => {
      if(!result.rows.length) {
        throw new UnauthorizationError('권한 없음.');
      }
      if(!result.rows[0].isOwn) {
        throw new UnauthorizationError('권한 없음.');
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
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID ?? null;
    const scheduleID = req.params?.scheduleID ?? null;
    if(teamID===null || scheduleID===null) {
      new Error('param Err');
    }
    const query = maria('query');
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isJoined) {
        throw new UnauthorizationError('권한 없음.')
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
        throw new UnauthorizationError('권한 없음.')
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
