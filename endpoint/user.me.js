const maria = require('../server/database');
const { NotFoundError } = require('../server/Types/Error');

module.exports = {
  Read(req, res, next) {
    const uuid = req.user?.id;
    if(!uuid) {
      throw new Error('paramErr');
    }
    maria('query')('select * from user where uuid=?', [
      uuid
    ])(result => {
      if(result.rows.length) {
        const profile = result.rows[0];
        res.json({
          uuid,
          profileName: profile.userProfileName,
          profileImage: profile.userProfileImg,
          profileImageDefault: profile.userProfileImgDefault
        });
      } else {
        throw new NotFoundError('존재하지 않는 사용자입니다.');
      }
    })().catch(err => next(err));

/*
    .then(rows => {
      // 위에처럼 중간 콜백을 주니까 res.json이나 res.send하면 이미 보냈다고
      // 적반하장이더라 이뭐병
      // Promise.then보다 콜백이 먼저라고 ㅡㅡ
      if(rows[0] && rows[0].length) {
        const profile = rows[0][0];
        console.log(profile);
        res.json({
          uuid,
          profileName: profile.userProfileName,
          profileImage: profile.userProfileImg,
          profileImageDefault: profile.userProfileImgDefault
        });
      } else {
        throw new NotFoundError('존재하지 않는 사용자입니다.');
      }
    })
    */
  }
};
