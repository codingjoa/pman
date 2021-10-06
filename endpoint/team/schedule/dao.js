const TeamDAO = require('../dao');
const permissions = require('./permissions');
class TeamScheduleDAO extends TeamDAO {
  constructor(req) {
    super(req);

    this.scheduleID = req.params?.scheduleID - 0;

    this.date = req.query?.date ?? null;
    this.start = req.query?.start - 0;
    this.limit = req.query?.limit - 0;

    this.schedulePublishAt = req.body?.schedulePublishAt;
    this.scheduleExpiryAt = req.body?.scheduleExpiryAt;
    this.scheduleContent = req.body?.scheduleContent;
    this.scheduleName = req.body?.scheduleName;
    this.scheduleTag = req.body?.scheduleTag ?? 0;
  }

  isScheduleOwner() {
    this.query('select teamSchedule.scheduleOwnerUserID=? as isScheduleOwner from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      this.requestUserID, this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isScheduleOwner: p?.isScheduleOwner
      };
    });
  }

  checkCreatePermissions() {
    this.isTeamPermissions();
    this.query((result, storage) => {
      if(storage.isTeamOwner) {
        return;
      }
      if(storage.isTeamPermission & permissions.SCHEDULE_WRITABLE) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }

  checkDeletePermissions() {
    this.isScheduleOwner();
    this.isTeamPermissions();
    this.query((result, storage) => {
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

  checkUpdatePermissions() {
    this.isScheduleOwner();
    this.query((result, storage) => {
      if(!storage.isScheduleOwner) {
        throw new Error('403 권한 없음');
      }
    });
  }

  async create(res) {
    this.isAuthorized();

    this.checkCreatePermissions();

    this.checkParameters(
      this.teamID,
      this.schedulePublishAt,
      this.scheduleExpiryAt,
      this.scheduleName,
      this.scheduleContent
    );

    return this.query('insert into teamSchedule(scheduleOwnerUserID, scheduleName, schedulePublishAt, scheduleExpiryAt, scheduleContent, scheduleTag, teamID) values (?, ?, ?, ?, ?, ?, ?)', [
      this.requestUserID, this.scheduleName, this.schedulePublishAt, this.scheduleExpiryAt, this.scheduleContent, this.scheduleTag, this.teamID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      const scheduleID = result.lastID;
      res.status(201);
      res.json({
        teamID: this.teamID,
        scheduleID
      });
    })();
  }

  async read(res) {
    this.isAuthorized();

    this.checkReadPermissions();

    this.checkParameters(this.teamID, this.start, this.limit);

    return this.query('select count(*) as sizeAll from teamSchedule where teamSchedule.teamID=?', [
      this.teamID
    ])(result => {
      return {
        sizeAll: result.rows[0].sizeAll
      }
    })('select teamSchedule.scheduleName, user.userProfileName as scheduleOwnerUserName, teamSchedule.schedulePublishAt, teamSchedule.scheduleExpiryAt, teamSchedule.scheduleReversion, teamSchedule.scheduleTag, teamSchedule.scheduleContent from teamSchedule left join user on teamSchedule.scheduleOwnerUserID=user.userID where teamSchedule.teamID=? limit ?, ?', [
      this.teamID, this.start, this.limit
    ])((result, storage) => {
      res.json({
        fetchOption: {
          teamID: this.teamID,
          date: this.date
        },
        fetchResult: {
          sizeAll: storage.sizeAll,
          schedules: result.rows
        }
      });
    })();
  }
}
module.exports = TeamScheduleDAO;
