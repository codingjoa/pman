const TeamScheduleCommentDAO = require('../dao');
class TeamScheduleCommentDetailDAO extends TeamScheduleCommentDAO {
  isCommentOwner() {
    this.query('select count(teamScheduleComment.userID=?)>0 as isCommentOwner from teamScheduleComment where teamScheduleComment.commentID=?', [
      this.requestUserID, this.commentID
    ])(result => {
      const p = result.rows?.[0];
      return {
        isCommentOwner: p?.isCommentOwner
      };
    });
  }

  checkDeletePermissions() {
    this.isCommentOwner();
    this.isScheduleOwner();
    this.isTeamPermissions();
    this.query((result, storage) => {
      if(storage.isCommentOwner) {
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

  checkUpdatePermissions() {
    this.isCommentOwner();
    this.query((result, storage) => {
      if(storage.isCommentOwner) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }

  async delete(res) {
    this.isAuthorized();

    this.checkDeletePermissions();

    this.checkParameters(
      this.commentID,
      this.teamID,
      this.scheduleID,
    );

    return this.query(
`delete from
  teamScheduleComment
where
  teamScheduleComment.commentID=? and
  teamScheduleComment.teamID=? and
  teamScheduleComment.scheduleID=?`, [
      this.commentID, this.teamID, this.scheduleID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        complete: true
      });
    })();
  }

  async update(res) {
    this.isAuthorized();

    this.checkUpdatePermissions();

    this.checkParameters(
      this.teamID,
      this.scheduleID,
      this.start,
      this.limit
    );

    return this.query(
`update
  teamScheduleComment
set
  teamScheduleComment.commentContent=?
where
  teamScheduleComment.commentID=? and
  teamScheduleComment.teamID=? and
  teamScheduleComment.scheduleID=?`, [
      this.commentContent, this.commentID, this.teamID, this.scheduleID
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.json({
        complete: true
      });
    })();
  }
}
module.exports = TeamScheduleCommentDetailDAO;
