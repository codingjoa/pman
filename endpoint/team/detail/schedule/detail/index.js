module.exports = (app, TeamScheduleModel) => {
  class TeamScheduleDetailModel extends TeamScheduleModel {
    constructor(req) {
      super(req);
      this.scheduleID = req.params?.scheduleID - 0;
      this.addRefUsers = req.body?.addRefUsers ?? [];
      this.deleteRefUsers = req.body?.deleteRefUsers ?? [];
    }

    async checkScheduleOwned(db) {
      const result = await db.get('select teamSchedule.userID=? as isScheduleOwner from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.requestUserID, this.teamID, this.scheduleID
      ])
      return result[0].isScheduleOwner===1;
    }

    async checkScheduleAvailable(db) {
      const result = await db.get('select teamSchedule.schedulePublishAt < current_timestamp as isPublished, teamSchedule.scheduleExpiryAt > current_timestamp as isNotExpired from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
        this.teamID, this.scheduleID
      ])
      return result[0].isScheduleOwner===0 && result[0].isNotExpired===1;
    }

    async checkScheduleType(db) {
      //'select teamSchedule.scheduleType as isScheduleType from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?'
      //this.teamID, this.scheduleID
      // 사용되지 않음.
    }

    async checkScheduleMember(db) {
      const result = await db.get('select count(teamScheduleWhitelist.userID=?)>0 as isWhitelistMember from teamScheduleWhitelist where teamScheduleWhitelist.teamID=? and teamScheduleWhitelist.scheduleID=?', [
        this.requestUserID, this.teamID, this.scheduleID
      ]);
      return result[0].isWhitelistMember===1;
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.scheduleID);
      //CHAR_LENGTH(teamScheduleReference.scheduleReferenceContent) as scheduleReferenceContentSize
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const users = await db.get(`select
          teamScheduleWhitelist.userID,
          user.userProfileName,
          case user.userProfileImg is null
            when 1
            then user.userProfileImgDefault
            else user.userProfileImg
          end as userProfileImg,
          teamScheduleWhitelist.userID=? as me
        from
          teamScheduleWhitelist left join
          user on
            teamScheduleWhitelist.userID=user.userID
        where
          teamScheduleWhitelist.teamID=? and
          teamScheduleWhitelist.scheduleID=?`, [
          this.requestUserID, this.teamID, this.scheduleID
        ]);
        const norefUsers = await db.get(`select
          teamMember.userID,
          user.userProfileName,
          case user.userProfileImg is null
            when 1
            then user.userProfileImgDefault
            else user.userProfileImg
          end as userProfileImg,
          teamMember.userID=? as me
        from
          teamMember left join
          user on
            teamMember.userID=user.userID
        where
          teamMember.teamID=? and
          teamMember.userID not in (
          select
            teamScheduleWhitelist.userID
          from
            teamScheduleWhitelist
          where
            teamScheduleWhitelist.teamID=? and
            teamScheduleWhitelist.scheduleID=?)`, [
          this.requestUserID, this.teamID, this.teamID, this.scheduleID
        ]);
        const schedules = await db.get(`select
          teamSchedule.scheduleName,
          user.userProfileName as scheduleOwnerUserName,
          user.userProfileImg as scheduleOwnerUserImg,
          teamSchedule.schedulePublishAt,
          teamSchedule.scheduleExpiryAt,
          teamSchedule.scheduleReversion,
          teamSchedule.scheduleType,
          teamSchedule.scheduleContent,
          teamFiles.fileUUID,
          teamFiles.fileName,
          teamSchedule.userID=? as owner
        from
          teamSchedule left join
          user on
            teamSchedule.userID=user.userID left join
          teamFiles on
            teamSchedule.fileUUID=teamFiles.fileUUID
        where
          teamSchedule.teamID=? and
          teamSchedule.scheduleID=?`, [
          this.requestUserID, this.teamID, this.scheduleID
        ]);
        if(!schedules.length) {
          throw new Error('404 내용 없음.');
        }
        res.json({
          ...schedules[0],
          users,
          teamID: this.teamID,
          scheduleID: this.scheduleID,
          norefUsers,
        });
      });
    }

    async checkUpdatePermissions(db) {
      if(await this.checkScheduleOwned(db)) {
        return;
      }
      throw new Error('403 권한 없음');
    }

    async checkDeletePermissions(db) {
      if(await this.checkScheduleOwned(db)) {
        return;
      }
      if(await this.checkTeamOwned(db)) {
        return;
      }
      throw new Error('403 권한 없음');
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.scheduleID);
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        const result = await db.get('delete from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?'[
          this.teamID, this.scheduleID
        ]);
        if(!result.affectedRows) {
          throw new Error('403 권한 없음');
        }
        res.json({
          complete: true
        });
      });
    }

    async patch(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.scheduleID);
      await this.dao.serialize(async db => {
        let changed = 0, scheduleReversion = false;
        await this.checkUpdatePermissions(db);
        if(this.schedulePublishAt !== undefined) {
          const result = await db.run('update teamSchedule set teamSchedule.schedulePublishAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            this.schedulePublishAt, this.teamID, this.scheduleID
          ]);
          result.affectedRows && changed++;
        }
        if(this.scheduleExpiryAt !== undefined) {
          const result = await db.run('update teamSchedule set teamSchedule.scheduleExpiryAt=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            this.scheduleExpiryAt, this.teamID, this.scheduleID
          ]);
          result.affectedRows && changed++;
        }
        if(this.scheduleName !== undefined) {
          const result = await db.run('update teamSchedule set teamSchedule.scheduleName=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            this.scheduleName, this.teamID, this.scheduleID
          ]);
          result.affectedRows && changed++;
        }
        if(this.scheduleContent !== undefined) {
          const result = await db.run('update teamSchedule set teamSchedule.scheduleContent=?, teamSchedule.scheduleReversion=teamSchedule.scheduleReversion+1 where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            this.scheduleContent, this.teamID, this.scheduleID
          ]);
          result.affectedRows && changed++;
          scheduleReversion = true;
        }
        if(this.scheduleTag !== undefined) {
          const result = await db.run('update teamSchedule set teamSchedule.scheduleTag=? where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
            this.scheduleTag, this.teamID, this.scheduleID
          ]);
          result.affectedRows && changed++;
        }
        if(this.addRefUsers.length) {
          for(const refUserID of this.addRefUsers) {
            const rows = await db.get('select count(teamScheduleWhitelist.userID=?)>0 as isRegCode from teamScheduleWhitelist where teamScheduleWhitelist.teamID=? and teamScheduleWhitelist.scheduleID=?', [
              refUserID, this.teamID, this.scheduleID
            ]);
            if(rows[0].isRegCode) {
              continue;
            }
            await db.run('insert into teamScheduleWhitelist(teamID, scheduleID, userID) values (?, ?, ?)', [
              this.teamID, this.scheduleID, refUserID
            ]);
            changed++;
          }
        }
        if(this.deleteRefUsers.length) {
          for(const refUserID of this.deleteRefUsers) {
            await db.run('delete from teamScheduleWhitelist where teamScheduleWhitelist.scheduleID=? and teamScheduleWhitelist.userID=? and teamScheduleWhitelist.teamID=?', [
              this.scheduleID, refUserID, this.teamID
            ]);
            changed++;
          }
        }
        res.json({
          complete: !!changed,
          scheduleReversion,
        });
      });
    }
  }
  app(TeamScheduleDetailModel);
  app.read();
  app.delete();
  app.patch();
  app.child('/comment', require('./comment'));
  app.child('/file', require('./file'));
};
