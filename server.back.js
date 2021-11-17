const app = require('./loadModules').app;
const api = app('/api/v1');
require('./endpoint/model2')(api, '/', null, require('./endpoint/route'));
const Model = require('./endpoint/model');
app.addErrorType(Model.Error400Parameter, {
  status: 400,
  message: '400 파라미터 오류',
});
app.addErrorType(Model.Error401, {
  status: 401,
  message: '401 Unauthorized',
});
app.addErrorType(Model.Error403Forbidden, {
  status: 403,
  message: '403 권한 없음',
});
app.addErrorType(Model.Error404, {
  status: 404,
  message: '404 내용 없음',
});
app.listen(5000);
