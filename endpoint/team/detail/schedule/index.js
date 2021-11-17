module.exports = (app, TeamDetailModel) => {
  class TeamScheduleModel extends TeamDetailModel {
    constructor(req) {
      super(req);
      this.date = req.query?.date;
      const start = req.query?.start - 0;
      const limit = req.query?.limit - 0;
      this.start = start === NaN ? null : start;
      this.limit = limit === NaN ? null : limit;

      this.schedulePublishAt = req.body?.schedulePublishAt;
      this.scheduleExpiryAt = req.body?.scheduleExpiryAt;
      this.scheduleContent = req.body?.scheduleContent;
      this.scheduleName = req.body?.scheduleName;
      //this.scheduleType = req.body?.scheduleType ?? 0;
    }

    async checkCreatePermissions(db) {
      // 이전에는 권한이 있어야만 가능했으나 계획 변경
      if(await this.checkTeamMember(db)) {
        return;
      }
      throw new Error('403 권한 없음');
    }

    async create(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.schedulePublishAt,
        this.scheduleExpiryAt,
        this.scheduleName,
        this.scheduleContent
      );
      await this.dao.serialize(async db => {
        await this.checkCreatePermissions(db);
        const result = await db.run(
          `insert into teamSchedule(
            teamID,
            userID,
            scheduleName,
            schedulePublishAt,
            scheduleExpiryAt,
            scheduleContent,
            scheduleType
          ) values (
            ?, ?, ?, ?, ?, ?, 0
          )`, [
            this.teamID,
            this.requestUserID,
            this.scheduleName,
            this.schedulePublishAt,
            this.scheduleExpiryAt,
            this.scheduleContent,
          ]
        );
        if(!result.affectedRows) {
          throw new Error('403 권한 없음');
        }
        res.status(201);
        res.json({
          complete: true
        });
      });
    }

    async getSchedules(db) {
      return await db.get(`select
        teamSchedule.scheduleID,
        teamSchedule.scheduleName,
        user.userProfileName as scheduleOwnerUserName,
        teamSchedule.schedulePublishAt,
        teamSchedule.scheduleExpiryAt,
        teamSchedule.scheduleReversion,
        teamSchedule.scheduleType,
        teamSchedule.scheduleContent,
        teamSchedule.userID=? as isMine,
        teamSchedule.scheduleExpiryAt>current_timestamp as isClosed,
        (select
          teamScheduleWhitelist.userID
        from
          teamSchedule as TS left join
          teamScheduleWhitelist on
            TS.teamID=teamScheduleWhitelist.teamID and
            TS.scheduleID=teamScheduleWhitelist.scheduleID
        where
          TS.teamID=teamSchedule.teamID and
          TS.scheduleID=teamSchedule.scheduleID and
          teamScheduleWhitelist.userID=?
        ) as isMyJob
      from
        teamSchedule left join
        user on
          teamSchedule.userID=user.userID
      where
        teamSchedule.teamID=?
      order by
        teamSchedule.scheduleID desc
      limit ?, ?`, [
        this.requestUserID, this.requestUserID, this.teamID, this.start, this.limit
      ]);
    }

    async getOpenSchedules(db) {
      return await db.get(`select
        teamSchedule.scheduleID,
        teamSchedule.scheduleName,
        user.userProfileName as scheduleOwnerUserName,
        teamSchedule.schedulePublishAt,
        teamSchedule.scheduleExpiryAt,
        teamSchedule.scheduleReversion,
        teamSchedule.scheduleType,
        teamSchedule.scheduleContent,
        teamSchedule.userID=? as isMine,
        (select
          teamScheduleWhitelist.userID
        from
          teamSchedule as TS left join
          teamScheduleWhitelist on
            TS.teamID=teamScheduleWhitelist.teamID and
            TS.scheduleID=teamScheduleWhitelist.scheduleID
        where
          TS.teamID=teamSchedule.teamID and
          TS.scheduleID=teamSchedule.scheduleID and
          teamScheduleWhitelist.userID=?
        ) as isMyJob
      from
        teamSchedule left join
        user on
          teamSchedule.userID=user.userID
      where
        teamSchedule.teamID=? and
        current_timestamp <= teamSchedule.scheduleExpiryAt
      order by
        teamSchedule.scheduleID desc`, [
          this.requestUserID, this.requestUserID, this.teamID
      ]);
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        if(this.start>=0 && this.limit>=0) {
          // getMeta
          const meta = await db.get('select count(*) as sizeAll from teamSchedule where teamSchedule.teamID=?', [
            this.teamID
          ]);
          const rows = await this.getSchedules(db);
          res.json({
            _meta: {
              start: this.start,
              limit: this.limit,
              sizeAll: meta[0].sizeAll
            },
            schedules: rows
          });
        } else {
          const rows = await this.getOpenSchedules(db);
          res.json({
            _meta: null,
            schedules: rows
          })
        }
      });
    }
  }
  app(TeamScheduleModel);
  app.create();
  app.read();
  app.child('/:scheduleID', require('./detail'));
}
