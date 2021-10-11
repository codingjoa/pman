const TeamScheduleSubmitDAO = require('../dao');
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
class TeamScheduleSubmitDetailDAO extends TeamScheduleSubmitDAO {
  checkDeletePermissions() {
    this.isSubmitOwner();
    this.isScheduleOwner();
    this.isTeamPermissions();
    this.isExists();
    this.query((result, storage) => {
      console.log(storage);
      if(!storage.isExists) {
        throw new Error('403 권한 없음');
      }
      if(storage.isSubmitOwner) {
        return;
      }
      if(storage.isScheduleOwner) {
        return;
      }
      if(storage.isTeamOwner) {
        return;
      }
      if(storage.isTeamPermission & permissions.SCHEDULE_MANAGEMENT) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }
  
  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(
      this.teamID,
      this.scheduleID,
      this.submitID
    );

    return this.query(
`select
  teamScheduleSubmit.fileUUID
from
  teamScheduleSubmit
where
  teamScheduleSubmit.submitID=? and
  teamScheduleSubmit.teamID=? and
  teamScheduleSubmit.scheduleID=?`, [
      this.submitID, this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        fileUUID: (p?.fileUUID) ? p.fileUUID : ''
      };
    })(
`delete from
  teamFiles
where
  teamFiles.fileUUID=?`, storage => ([
      storage.fileUUID
    ]))(
`delete from
  teamScheduleSubmit
where
  teamScheduleSubmit.submitID=? and
  teamScheduleSubmit.teamID=? and
  teamScheduleSubmit.scheduleID=?`, [
      this.submitID, this.teamID, this.scheduleID
    ])((result, storage) => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      if(storage.fileUUID !== null) {
        fs.rmSync(path.join(ROOT, 'static/file', storage.fileUUID), {
          force: false
        });
      }

      res.json({
        complete: true
      });
    })();
  }
}
module.exports = TeamScheduleSubmitDetailDAO;
