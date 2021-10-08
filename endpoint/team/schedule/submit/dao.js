const TeamScheduleFileDAO = require('../file/dao');
const fs = require('fs');
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

  isExists() {
    if(this.submitID) {
      this.query('select count(*)>0 as isExists from teamScheduleSubmit where teamScheduleSubmit.submitID=?', [
        this.submitID
      ])(result => {
        const p = result.rows?.[0];
        return {
          isExists: p?.isExists
        };
      });
    } else {
      this.query('select count(*)>0 as isExists from teamScheduleSubmit where teamScheduleSubmit.teamID=? and teamScheduleSubmit.scheduleID=? and teamScheduleSubmit.userID=?', [
        this.teamID, this.scheduleID, this.requestUserID
      ])(result => {
        const p = result.rows?.[0];
        return {
          isExists: p?.isExists
        };
      });
    }
  }

  checkCreatePermissions() {
    this.isScheduleType();
    this.isWhitelistMember();
    this.isExists();
    this.query((result, storage) => {
      if(storage.isExists) {
        throw new Error('400 제출됨');
      }
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

  async create(res) {
    this.isAuthorized();

    this.checkCreatePermissions();

    const req = await this.uploadFile(res);
    this.checkParameters(
      req.body.submitContent,
      this.teamID,
      this.scheduleID,
      this.requestUserID
    );

    if(req.file) {
      this.query(
`insert into teamFiles (
  fileUUID,
  fileName
) values (
  ?,
  ?
)`, [
        req.file, req.fileName
      ])(result => {
        if(!result.affectedRows) {
          fs.rmSync(req.path);
          throw new Error('403 권한 없음');
        }
      });
    }

    return this.query(
`insert into teamScheduleSubmit(
  teamID,
  scheduleID,
  userID,
  submitContent,
  fileUUID
) values (
  ?,
  ?,
  ?,
  ?,
  ?
)`, [
      this.teamID,
      this.scheduleID,
      this.requestUserID,
      req.body.submitContent,
      (req.file ?? null)
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.status(201);
      res.json({
        complete: true
      });
    })().catch(err => {
      fs.rmSync(req.path);
      throw err;
    });
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
