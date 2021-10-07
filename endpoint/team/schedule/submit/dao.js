const TeamScheduleFileDAO = require('../file/dao');
class TeamScheduleSubmitDAO extends TeamScheduleFileDAO {
  constructor(req) {
    super(req);

    this.submitID = req.params?.submitID - 0;

    this.submitContent = req.body?.submitContent;
  }

  isSubmitOwner() {
    this.query('select count(teamScheduleSubmit.userID=?)>0 as isSubmitOwner from teamScheduleSubmit where teamScheduleSubmit.submitID=?', [
      this.requestUserID, this.submitID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isSubmitOwner: p?.isSubmitOwner
      };
    });
  }

  checkCreatePermissions() {
    this.isScheduleType();
    this.isWhitelistMember();
    this.query((result, storage) => {
      if(storage.isScheduleType === 1 && storage.isWhitelistMember) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }

  checkDeletePermissions() {
    this.isSubmitOwner();
    this.isScheduleOwner();
    this.isTeamPermissions();
    this.query((result, storage) => {
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

  async create(res) {
    this.isAuthorized();

    this.checkCreatePermissions();

    this.checkParameters(
      this.submitContent,
      this.teamID,
      this.scheduleID,
      this.requestUserID
    );

    return this.query(async result => {
      return this.uploadFile(res);
    })(
`insert into teamFiles (
  fileUUID,
  fileName
) values (
  ?,
  ?
)`, storage => ([
      storage.file,
      storage.fileName
    ]))(
`insert into teamScheduleSubmit(
  teamID,
  scheduleID,
  userID,
  submitContent,
  fileUUID
) vaules (
  ?,
  ?,
  ?,
  ?,
  ?
)`, storage => ([
      this.teamID,
      this.scheduleID,
      this.requestUserID,
      this.submitContent,
      this.file
    ]))(result => {
      if(!result.affectedRows) {
        fs.rmSync(storage.path);
        throw new Error('403 권한 없음');
      }
      res.status(201);
      res.json({
        complete: true
      });
    })();
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
        fileUUID: p?.fileUUID ?? ''
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
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        complete: true
      });
    })();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(
      this.teamID,
      this.scheduleID,
      this.start,
      this.limit
    );

    return this.query('select count(*) as sizeAll from teamScheduleSubmit where teamScheduleSubmit.teamID=? and teamScheduleSubmit.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      return {
        sizeAll: result.rows[0].sizeAll
      }
    })(
`select
  teamScheduleSubmit.submitID,
  user.userProfileName as commentUserName,
  teamScheduleSubmit.submitPublishAt,
  teamScheduleSubmit.submitContent,
  teamScheduleSubmit.fileUUID
from
  teamScheduleSubmit left join
  user on
    teamScheduleSubmit.userID=user.userID
where
  teamScheduleSubmit.teamID=? and
  teamScheduleSubmit.scheduleID=?
limit
  ?, ?`, [
      this.teamID, this.scheduleID, this.start, this.limit
    ])((result, storage) => {
      res.json({
        fetchOption: {
          teamID: this.teamID,
          scheduleID: this.scheduleID,
          start: this.start,
          limit: this.limit,
        },
        fetchResult: {
          sizeAll: storage.sizeAll,
          schedules: result.rows
        }
      });
    })();
  }
}
module.exports = TeamScheduleSubmitDAO;
