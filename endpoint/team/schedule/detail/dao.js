const TeamScheduleDAO = require('../dao');
class TeamScheduleDetailDAO extends TeamScheduleDAO {
  constructor(req) {
    super(req);

    this.addRefUsers = req.body?.addRefUsers ?? [];
    this.deleteRefUsers = req.body?.deleteRefUsers ?? [];
  }

  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(this.teamID, this.scheduleID);
    return this.query('delete from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        scheduleID: this.scheduleID,
        complete: true
      });
    })();
  }

  async patch(res) {
    this.isAuthorized();

    this.checkUpdatePermissions();

    this.checkParameters(this.teamID, this.scheduleID);
    if(this.schedulePublishAt !== undefined) {
      this.query('update teamSchedule set teamSchedule.schedulePublishAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.schedulePublishAt, this.teamID, this.scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(this.scheduleExpiryAt !== undefined) {
      this.query('update teamSchedule set teamSchedule.scheduleExpiryAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.scheduleExpiryAt, this.teamID, this.scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(this.scheduleName !== undefined) {
      this.query('update teamSchedule set teamSchedule.scheduleName=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.scheduleName, this.teamID, this.scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(this.scheduleContent !== undefined) {
      this.query('update teamSchedule set teamSchedule.scheduleContent=?, teamSchedule.scheduleReversion=teamSchedule.scheduleReversion+1 where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.scheduleContent, this.teamID, this.scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
        return {
          scheduleReversion: true
        }
      });
    }
    if(this.scheduleTag !== undefined) {
      this.query('update teamSchedule set teamSchedule.scheduleTag=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.scheduleTag, this.teamID, this.scheduleID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(this.addRefUsers.length) {
      for(const refUserID of this.addRefUsers) {
        this.query('select count(teamScheduleReference.userID=?)>0 as isRegCode from teamScheduleReference where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=?', [
          refUserID, this.teamID, this.scheduleID
        ])(result => {
          if(result.rows[0].isRegCode) {
            throw new Error();
          }
        })('insert into teamScheduleReference(scheduleID, userID, teamID) values (?, ?, ?)', [
          this.scheduleID, refUserID, this.teamID
        ])(result => {
          if(!result.affectedRows) {
            throw new new Error();
          }
        });
      }
    }
    if(this.deleteRefUsers.length) {
      for(const refUserID of this.deleteRefUsers) {
        this.query('delete from teamScheduleReference where teamScheduleReference.scheduleID=? and teamScheduleReference.userID=? and teamScheduleReference.teamID=?', [
          this.scheduleID, refUserID, this.teamID
        ])(result => {
          if(!result.affectedRows) {
            throw new new Error();
          }
        });
      }
    }

    return this.query((result, storage) => {
      res.json({
        scheduleID: this.scheduleID,
        scheduleReversion: storage?.scheduleReversion ?? false
      });
    })();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(this.teamID, this.scheduleID);
    return this.query('select teamScheduleReference.scheduleReferenceID, teamScheduleReference.userID, user.userProfileName, case user.userProfileImg is null when 1 then user.userProfileImgDefault else user.userProfileImg end as userProfileImg, teamScheduleReference.scheduleReferencePublishAt, teamScheduleReference.scheduleReferenceTag, CHAR_LENGTH(teamScheduleReference.scheduleReferenceContent) as scheduleReferenceContentSize from teamScheduleReference left join user on teamScheduleReference.userID=user.userID where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      return {
        scheduleReferences: result.rows
      };
    })('select teamScheduleFile.scheduleFile from teamScheduleFile where teamScheduleFile.scheduleID=?', [
      this.scheduleID
    ])(result => {
      return {
        scheduleFiles: result.rows
      };
    })('select teamSchedule.scheduleName, user.userProfileName as scheduleOwnerUserName, teamSchedule.schedulePublishAt, teamSchedule.scheduleExpiryAt, teamSchedule.scheduleReversion, teamSchedule.scheduleTag, teamSchedule.scheduleContent from teamSchedule left join user on teamSchedule.scheduleOwnerUserID=user.userID where teamSchedule.teamID=? and teamSchedule.scheduleID=? ', [
      this.teamID, this.scheduleID
    ])((result, storage) => {
      if(!result.rows.length) {
        throw new Error('404 내용 없음.');
      }
      res.json({
        ...result.rows[0],
        scheduleReferences: storage.scheduleReferences,
        scheduleFiles: storage.scheduleFiles,
        teamID: this.teamID,
        scheduleID: this.scheduleID
      });
    })();
  }
}
module.exports = TeamScheduleDetailDAO;
