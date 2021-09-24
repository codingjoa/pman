const maria = require('../server/database');
const { NotFoundError, UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Read(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    maria('query')('select * from user where userID=?', [
      userID
    ])(result => {
      if(result.rows.length) {
        const profile = result.rows[0];
        res.json({
          userID,
          profileName: profile.userProfileName,
          profileImage: profile?.userProfileImg ?? profile.userProfileImgDefault
        });
      } else {
        throw new NotFoundError('존재하지 않는 사용자입니다.');
      }
    })().catch(err => next(err));
  },
  Patch(req, res, next) {
    const userID = req.user?.id;
    if(!userID) {
      throw new UnauthorizationError();
    }
    const query = maria('query');
    if(req.body?.profileName) {
      query('update user set userProfileName=? where userID=?', [
        req.body.profileName,
        userID
      ])(result => {
        if(!result.affectedRows) {
          throw new Error('적용되지 않았습니다.');
        }
      });
    }
    query(() => {
      res.json({
        userID
      });
    })().catch(err => next(err));
  }
};
