const maria = require('../server/database');
const { NotFoundError, UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Read(req, res, next) {
    const uuid = req.user?.id;
    if(!uuid) {
      throw new UnauthorizationError();
    }
    maria('query')('select * from user where uuid=?', [
      uuid
    ])(result => {
      if(result.rows.length) {
        const profile = result.rows[0];
        res.json({
          uuid,
          profileName: profile.userProfileName,
          profileImage: profile?.userProfileImg ?? profile.userProfileImgDefault
        });
      } else {
        throw new NotFoundError('존재하지 않는 사용자입니다.');
      }
    })().catch(err => next(err));
  },
  Patch(req, res, next) {
    const uuid = req.user?.id;
    if(!uuid) {
      throw new UnauthorizationError();
    }
    const query = maria('query');
    if(req.body?.profileName) {
      query('update user set userProfileName=? where uuid=?', [
        req.body.profileName,
        uuid
      ])(result => {
        if(!result.affectedRows) {
          throw new Error('적용되지 않았습니다.');
        }
      });
    }
    query().then(() => {
      res.redirect('/api/v1/user/me');
    }).catch(err => next(err));
  }
};
