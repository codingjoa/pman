const TeamDAO = require('../dao');
const permissions = require('./permissions');
class TeamScheduleDAO extends TeamDAO {
  constructor(req) {
    super(req);

    this.scheduleID = req.params?.scheduleID - 0;

    this.date = req.query?.date ?? null;
    const start = req.query?.start - 0;
    const limit = req.query?.limit - 0;
    this.start = !start ? 0 : start;
    this.limit = !limit ? 30 : limit;

    this.schedulePublishAt = req.body?.schedulePublishAt;
    this.scheduleExpiryAt = req.body?.scheduleExpiryAt;
    this.scheduleContent = req.body?.scheduleContent;
    this.scheduleName = req.body?.scheduleName;
    this.scheduleType = req.body?.scheduleType ?? 0;
  }

  isScheduleOwner() {
    this.query('select teamSchedule.userID=? as isScheduleOwner from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      this.requestUserID, this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isScheduleOwner: p?.isScheduleOwner
      };
    });
  }

  isScheduleDate() {
    this.query('select teamSchedule.schedulePublishAt < current_timestamp as isPublished, teamSchedule.scheduleExpiryAt > current_timestamp as isNotExpired from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isPublished: p?.isPublished,
        isNotExpired: p?.isNotExpired
      };
    });
  }

  isScheduleType() {
    this.query('select teamSchedule.scheduleType as isScheduleType from teamSchedule where teamSchedule.teamID=? and teamSchedule.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isScheduleType: p?.isScheduleType ?? -1
      };
    });
  }

  isWhitelistMember() {
    this.query('select count(teamScheduleWhitelist.userID=?)>0 as isWhitelistMember from teamScheduleWhitelist where teamScheduleWhitelist.teamID=? and teamScheduleWhitelist.scheduleID=?', [
      this.requestUserID, this.teamID, this.scheduleID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isWhitelistMember: p?.isWhitelistMember
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

    return this.query(
`insert into teamSchedule(
  teamID,
  userID,
  scheduleName,
  schedulePublishAt,
  scheduleExpiryAt,
  scheduleContent,
  scheduleType
) values (
  ?, ?, ?, ?, ?, ?, ?
)`, [
      this.teamID,
      this.requestUserID,
      this.scheduleName,
      this.schedulePublishAt,
      this.scheduleExpiryAt,
      this.scheduleContent,
      this.scheduleType
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
    })(
`select
  teamSchedule.scheduleID,
  teamSchedule.scheduleName,
  user.userProfileName as scheduleOwnerUserName,
  teamSchedule.schedulePublishAt,
  teamSchedule.scheduleExpiryAt,
  teamSchedule.scheduleReversion,
  teamSchedule.scheduleType,
  teamSchedule.scheduleContent
from
  teamSchedule left join
  user on
    teamSchedule.userID=user.userID
where
  teamSchedule.teamID=?
limit
  ?, ?`, [
      this.teamID, this.start, this.limit
    ])((result, storage) => {
      res.json({
        fetchOption: {
          teamID: this.teamID,
          date: this.date,
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
module.exports = TeamScheduleDAO;
