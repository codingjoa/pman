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
team('/:teamID/schedule/:scheduleID', require('./endpoint/team.detail.schedule.detail'));
team('/:teamID/schedule/:scheduleID/:scheduleReferenceID', require('./endpoint/team.detail.schedule.detail.reference.detail'));
team('/:teamID/user/:userID', require('./endpoint/team.detail.user'));
const test = api('/test');
test('/upload', require('./endpoint/file.service'));

app.listen(5000);
