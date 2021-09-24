const maria = require('../server/database');
const { UnauthorizationError } = require('../server/Types/Error');

async function createScheduleGenerator(req, res) {
  const userID = req.user?.id;
  if(!userID) {
    throw new UnauthorizationError();
  }
  const teamID = req.body?.teamID;
  const refUsers = req.body?.refUsers ?? [];
  const schedulePublishAt = req.body?.schedulePublishAt;
  const scheduleExpiryAt = req.body?.scheduleExpiryAt;
  if(!teamID) {
    throw new Error('param err');
  }

  const query = maria('generator');
  let result = null;
  result = await query.next({
    query: 'select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?',
    state: [
      userID, teamID
    ]
  });
  console.log(result);
  if(!result.rows[0].isJoined) {
    await query.next(new UnauthorizationError('권한 없음.'));
  }

  result = await query.next({
    query: 'insert into teamSchedule(scheduleOwnerUserID, schedulePublishAt, scheduleExpiryAt, teamID) values (?, ?, ?, ?)',
    state: [
      userID, schedulePublishAt, scheduleExpiryAt, teamID
    ]
  });
  if(!result.affectedRows) {
    await query.next(new UnauthorizationError('권한 없음.'));
  }
  const scheduleID = result.lastID;

  for(const refUserID of refUsers) {
    result = await query.next({
      query: 'insert into teamScheduleReference(scheduleID, userID, teamID), values (?, ?, ?)',
      state: [
        scheduleID, refUserID, teamID
      ]
    });
    if(!result.affectedRows) {
      await query.next(new Error());
    }
  }

  await query.next();

  res.status(201);
  res.json({
    teamID,
    scheduleID
  });
}

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
  Patch(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID;
    const scheduleID = req.body?.scheduleID;
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
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isJoined) {
        throw new UnauthorizationError('권한 없음.')
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
    const teamID = req.params?.teamID;
    const scheduleID = req.query?.scheduleID;
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
    })('select teamScheduleReference.scheduleReferenceID, teamScheduleReference.userID, teamScheduleReference.scheduleReferencePublishAt, teamScheduleReference.scheduleReferenceTag, CHAR_LENGTH(teamScheduleReference.scheduleReferenceContent) as scheduleReferenceContentSize from teamScheduleReference where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=?', [
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
