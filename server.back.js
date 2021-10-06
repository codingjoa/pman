const app = require('./loadModules').app;
const api = app('/api/v1');

const oauth = api('/oauth');
oauth('/kakao', require('./endpoint/oauth.kakao'));
oauth('/refresh', require('./endpoint/oauth.refresh'));
const user = api('/user');
user('/me', require('./endpoint/user.me'));
const team = api('/team');
team('/', require('./endpoint/team'));
team('/invite', require('./endpoint/team/invite/readonly'));
team('/:teamID', require('./endpoint/team/detail'));
team('/:teamID/invite', require('./endpoint/team/invite'));
team('/:teamID/schedule', require('./endpoint/team/schedule'));
team('/:teamID/schedule/:scheduleID', require('./endpoint/team/schedule/detail'));
team('/:teamID/schedule/:scheduleID/file', require('./endpoint/team/schedule/file'));
team('/:teamID/schedule/:scheduleID/:scheduleReferenceID', require('./endpoint/team.detail.schedule.detail.reference.detail'));
team('/:teamID/user/:userID', require('./endpoint/team/user'));
const test = api('/test');
test('/upload', require('./endpoint/file.service'));

app.listen(5000);
