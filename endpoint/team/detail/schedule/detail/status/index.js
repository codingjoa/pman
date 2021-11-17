module.exports = (app, TeamScheduleDetailModel) => {
  class TeamScheduleStatusModel extends TeamScheduleDetailModel {
    constructor(req) {
      super(req);
      this.statusContent = req.body?.statusContent;
    }

    async checkStatusExist(db) {
      const status = await db.get('select count(*)>0 as isExist from teamScheduleStatus where teamScheduleStatus.teamID=? and teamScheduleStatus.scheduleID=? and teamScheduleStatus.userID=?', [
        this.teamID, this.sheduleID, this.requestUserID
      ]);
      return !! status[0].isExist;
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
        this.start,
        this.limit,
      );
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const status = await db.get(`select
          user.userProfileName as userProfileName,
          user.userProfileImg as userProfileImg,
          teamScheduleStatus.statusPublishAt,
          teamScheduleStatus.statusContent
        from
          teamScheduleStatus left join
          user on
            teamScheduleStatus.userID=user.userID
        where
          teamScheduleStatus.teamID=? and
          teamScheduleStatus.scheduleID=?`, [
          this.teamID, this.scheduleID
        ]);
        res.json({
          _meta: null,
          status,
        });
      });
    }

    async checkUpdatePermissions(db) {
      if(!await this.checkScheduleMember(db)) {
        throw new TeamScheduleStatusModel.Error403Forbidden();
      }
      if(!await this.checkScheduleAvailable(db)) {
        throw new Error('400 만료됨');
        //throw new TeamScheduleStatusModel.Error400('만료됨');
      }
    }

    async update(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
        this.statusContent,
      );
      await this.dao.serialize(async db => {
        await this.checkCreatePermissions(db);
        if(await this.checkStatusExist(db)) {
          // update 쿼리
        } else {
          // insert 쿼리
          const result = await db.run(`insert into teamScheduleStatus(
              teamID,
              scheduleID,
              userID,
              statusContent
            ) values (
              ?,
              ?,
              ?,
              ?
            )`, [
            this.teamID, this.scheduleID, this.requestUserID, req.body.submitContent,
          ]);
          if(!result.affectedRows) {
            throw new Error('403 권한 없음');
          }
          res.json({
            complete: true
          });
        }
      });
    }
  }
  app(TeamScheduleStatusModel);
  app.read();
  app.update();
}
