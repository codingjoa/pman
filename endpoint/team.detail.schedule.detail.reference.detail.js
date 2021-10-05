const maria = require('../loadModules').maria;
const { UnauthorizationError } = require('../loadModules').Error;

module.exports = {
  Patch(req, res, next) {
    // 자신의 업무 내용 수정
    // 매 수정때마다 PublishAt 수정
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID ?? null;
    const scheduleID = req.params?.scheduleID ?? null;
    const scheduleReferenceID = req.params?.scheduleReferenceID ?? null;
    const scheduleReferenceTag = req.body?.scheduleReferenceTag;
    const scheduleReferenceContent = req.body?.scheduleReferenceContent;
    if(teamID===null || scheduleID===null || scheduleReferenceID===null) {
      new Error('400 파라미터 오류');
    }
    const query = maria('query');
    query('select teamScheduleReference.userID=? as isReferenceOwn from teamScheduleReference where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=? and teamScheduleReference.scheduleReferenceID=?', [
      userID, teamID, scheduleID, scheduleReferenceID
    ])(result => {
      if(!result.rows?.[0]?.isReferenceOwn) {
        throw new Error('403 권한 없음');
      }
    });
    if(scheduleReferenceTag !== undefined) {
      query('update teamScheduleReference set teamScheduleReference.scheduleReferenceTag=? where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=? and teamScheduleReference.scheduleReferenceID=?', [
        scheduleReferenceTag, teamID, scheduleID, scheduleReferenceID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    if(scheduleReferenceContent !== undefined) {
      query('update teamScheduleReference set teamScheduleReference.scheduleReferenceContent=? where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=? and teamScheduleReference.scheduleReferenceID=?', [
        scheduleReferenceContent, teamID, scheduleID, scheduleReferenceID
      ])(result => {
        if(!result.affectedRows) {
          throw new new Error();
        }
      });
    }
    query('update teamScheduleReference set scheduleReferencePublishAt=current_timestamp where teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=? and teamScheduleReference.scheduleReferenceID=?', [
      teamID, scheduleID, scheduleReferenceID
    ])(result => {
      if(!result.affectedRows) {
        throw new new Error();
      }
      res.json({
        scheduleReferenceID
      });
    })().catch(err => next(err));
  },
  Read(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const teamID = req.params?.teamID ?? null;
    const scheduleID = req.params?.scheduleID ?? null;
    const scheduleReferenceID = req.params?.scheduleReferenceID ?? null;
    if(teamID===null || scheduleID===null || scheduleReferenceID===null) {
      new Error('400 파라미터 오류');
    }
    const query = maria('query');
    query('select team.teamProfileName, count(teamMember.userID=?)>0 as isJoined from team left join teamMember on team.teamID=teamMember.teamID where team.teamID=?', [
      userID, teamID
    ])(result => {
      if(!result.rows[0].isTeamMember) {
        throw new Error('403 권한 없음.');
      }
    })('select teamScheduleReferenceFile.scheduleReferenceFile from teamScheduleReferenceFile where teamScheduleReferenceFile.scheduleReferenceID=?', [
      scheduleReferenceID
    ])(result => {
      return {
        files: result.rows
      };
    })('select user.userProfileName as scheduleReferenceUserName, teamScheduleReference.scheduleReferencePublishAt, teamScheduleReference.scheduleReferenceTag, teamScheduleReference.scheduleReferenceContent from teamScheduleReference left join user on teamScheduleReference.userID=user.userID where teamScheduleReference.scheduleReferenceID=? and teamScheduleReference.teamID=? and teamScheduleReference.scheduleID=? ', [
      scheduleReferenceID, teamID, scheduleID
    ])((result, storage) => {
      if(!result.rows.length) {
        throw new Error('403 권한 없음.');
      }
      res.json({
        ...result.rows[0],
        scheduleReferenceFiles: storage.files,
        teamID,
        scheduleID
      });
    })().catch(err => next(err));
  }
};
