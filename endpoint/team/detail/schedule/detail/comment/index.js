module.exports = (app, TeamScheduleDetailModel) => {
  class TeamScheduleCommentModel extends TeamScheduleDetailModel {
    constructor(req) {
      super(req);
      this.commentContent = req.body?.commentContent;
    }

    async checkCreatePermissions(db) {
      //this.checkScheduleType(); isScheduleType === 0  이제 타입을 따지지 않습니다.
      //this.checkScheduleAvailable();
      //this.checkScheduleMember();
      if(await this.checkTeamMember(db)) {
        // 팀원 모두 댓글 작성 가능
        return;
      }
      throw new Error('403 권한 없음');
    }

    async create(res) {
      this.isAuthorized();
      this.checkParameters(
        this.commentContent,
        this.teamID,
        this.scheduleID,
        this.requestUserID
      );
      await this.dao.serialize(async db => {
        await this.checkCreatePermissions(db);
        const result = await db.run(`insert into teamScheduleComment(
          teamID,
          scheduleID,
          userID,
          commentContent
        ) values (
          ?,
          ?,
          ?,
          ?
        )`, [
          this.teamID,
          this.scheduleID,
          this.requestUserID,
          this.commentContent
        ]);
        if(!result.affectedRows) {
          throw new TeamScheduleDAO.Error403('403 권한 없음');
        }
        res.status(201);
        res.json({
          complete: true
        });
      });
    }

    async read(res) {
      this.isAuthorized();
      //this.checkReadPermissions();
      this.checkParameters(
        this.teamID,
        this.scheduleID,
        this.start,
        this.limit
      );
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const meta = await db.get('select count(*) as sizeAll from teamScheduleComment where teamScheduleComment.teamID=? and teamScheduleComment.scheduleID=?', [
          this.teamID, this.scheduleID
        ]);
        const rows = await db.get(`select
          teamScheduleComment.commentID,
          user.userProfileName as commentUserName,
          user.userProfileImg as commentUserImg,
          teamScheduleComment.commentCreatedAt,
          teamScheduleComment.commentContent,
          teamScheduleComment.userID=? as isOwned
        from
          teamScheduleComment left join
          user on
            teamScheduleComment.userID=user.userID
        where
          teamScheduleComment.teamID=? and
          teamScheduleComment.scheduleID=?
        order by
          teamScheduleComment.commentID desc
        limit
          ?, ?`, [
          this.requestUserID, this.teamID, this.scheduleID, this.start, this.limit
        ]);

        res.json({
          _meta: {
            start: this.start,
            limit: this.limit,
            sizeAll: meta[0]?.sizeAll
          },
          comments: rows
        })
      });
    }
  }
  app(TeamScheduleCommentModel);
  app.create();
  app.read();
  app.child('/:commentID', require('./detail'));
};
