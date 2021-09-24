const app = require('./server/server');
const api = app('/api/v1');

const account = api('/account', require('./endpoint/account'));
const oauth = api('/oauth');
oauth('/kakao', require('./endpoint/oauth.kakao'));
oauth('/refresh', require('./endpoint/oauth.refresh'));
const user = api('/user');
user('/me', require('./endpoint/user.me'));
const team = api('/team');
team('/', require('./endpoint/team'));
team('/invite', require('./endpoint/team.invite'));
team('/:teamID', require('./endpoint/team.detail'));
team('/:teamID/schedule', require('./endpoint/team.detail.schedule'));
team('/:teamID/user/:userID', require('./endpoint/team.detail.user'));

api('/test')('/:p1/:p2/:p3/:p4', {
  Read(req, res) {
    const { p1, p2, p3, p4 } = req.params;
    if(p4 === 'error') {
      const {NotFoundError} = require('./server/Types/Error');
      throw new NotFoundError('자료를 찾을 수 없습니다.');
      throw new Error('고의적인 오류 발생');
    } else {
      res.json({ p1, p2, p3, p4, message: '어 퇴사기원' });
    }
  }
});
/*
api('/token', {
  Read(req, res) {
    res.json({ user: req.user });
    console.log(req.user);
  }
});
*/

('/:fn', {
  Read(req, res) {

  }
});

app.listen(5000);
