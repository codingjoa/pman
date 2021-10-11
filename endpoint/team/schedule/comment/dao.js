const TeamScheduleDAO = require('../dao');
class TeamScheduleCommentDAO extends TeamScheduleDAO {
  constructor(req) {
    super(req);

    this.commentID = req.params?.commentID - 0;

    this.commentContent = req.body?.commentContent;
  }

  checkCreatePermissions() {
    this.isScheduleType();
    this.isScheduleDate();
    this.isWhitelistMember();
    this.query((result, storage) => {
      if(!storage.isPublished || !storage.isNotExpired) {
        throw new Error('403 만료됨');
      }
      if(storage.isScheduleType === 0 && storage.isWhitelistMember) {
        return;
      }
      throw new Error('403 권한 없음');
    });
  }

  async create(res) {
    this.isAuthorized();

    this.checkCreatePermissions();

    this.checkParameters(
      this.commentContent,
      this.teamID,
      this.scheduleID,
      this.requestUserID
    );

    return this.query(
`insert into teamScheduleComment(
  teamID,
  scheduleID,
  userID,
  commentContent
) vaules (
  ?,
  ?,
  ?,
  ?
)`, [
      this.teamID,
      this.scheduleID,
      this.requestUserID,
      this.commentContent
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('403 권한 없음');
      }
      res.status(201);
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

    return this.query('select count(*) as sizeAll from teamScheduleComment where teamScheduleComment.teamID=? and teamScheduleComment.scheduleID=?', [
      this.teamID, this.scheduleID
    ])(result => {
      return {
        sizeAll: result.rows[0].sizeAll
      }
    })(
`select
  teamScheduleComment.commentID,
  user.userProfileName as commentUserName,
  teamScheduleComment.commentCreatedAt,
  teamScheduleComment.commentContent
from
  teamScheduleComment left join
  user on
    teamScheduleComment.userID=user.userID
where
  teamScheduleComment.teamID=? and
  teamScheduleComment.scheduleID=?
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
module.exports = TeamScheduleCommentDAO;
