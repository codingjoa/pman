module.exports = (app, TeamScheduleCommentModel) => {
  class TeamScheduleCommentDetailModel extends TeamScheduleCommentModel {
    constructor(req) {
      super(req);
      this.commentID = req.params?.commentID - 0;
    }

    async checkCommentOwned(db) {
      const result = await db.get('select count(teamScheduleComment.userID=?)>0 as isCommentOwner from teamScheduleComment where teamScheduleComment.commentID=?', [
        this.requestUserID, this.commentID
      ])
      return result[0].isCommentOwner===1;
    }

    async checkUpdatePermissions(db) {
      if(await this.checkCommentOwned(db)) {
        // 댓글 주인이거나
        return;
      }
      throw new Error('403 권한 없음');
    }

    async update(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
        this.start,
        this.limit
      );
      await this.dao.serialize(async db => {
        await this.checkUpdatePermissions(db);
        const result = await db.run(`update
          teamScheduleComment
        set
          teamScheduleComment.commentContent=?
        where
          teamScheduleComment.commentID=? and
          teamScheduleComment.teamID=? and
          teamScheduleComment.scheduleID=?`, [
          this.commentContent, this.commentID, this.teamID, this.scheduleID
        ]);
        if(!result.affectedRows) {
          throw new Error('403 권한 없음');
        }
        res.json({
          complete: true
        });
      });
    }

    async checkDeletePermissions(db) {
      if(await this.checkCommentOwned(db)) {
        // 댓글 주인이거나
        return;
      }
      if(await this.checkScheduleOwned(db)) {
        // 일정 주인이거나
        return;
      }
      if(await this.checkTeamOwned(db)) {
        // 팀 주인이거나
        return;
      }
      throw new Error('403 권한 없음');
      //permissions.SCHEDULE_MANAGEMENT
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(
        this.commentID,
        this.teamID,
        this.scheduleID,
      );
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        const result = await db.run(`delete from
          teamScheduleComment
        where
          teamScheduleComment.commentID=? and
          teamScheduleComment.teamID=? and
          teamScheduleComment.scheduleID=?`, [
          this.commentID, this.teamID, this.scheduleID
        ]);
        if(!result.affectedRows) {
          throw new Error('403 권한 없음');
        }
        res.json({
          complete: true
        });
      });
    }
  }
  app(TeamScheduleCommentDetailModel);
  app.update();
  app.delete();
}
