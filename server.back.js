const loader = require('./loadModules').app;
const Make2Model = require('./loadModules').Make2Model;
const app = loader();
const api = app('/api/v1');
Make2Model(api, '/', null, require('./endpoint/route'));
const Model = require('./endpoint/model');
app.addErrorType(Model.Error400Parameter, {
  status: 400,
  message: 'INVALID_PARAMETER',
});
app.addErrorType(Model.Error400, {
  status: 400,
});
app.addErrorType(Model.Error401, {
  status: 401,
  message: 'UNAUTHORIZED',
});
app.addErrorType(Model.Error403, {
  status: 403,
  message: 'FORBIDDEN',
});
app.addErrorType(Model.Error404, {
  status: 404,
  message: 'NOT_FOUND',
});
app.addErrorType(Model.Error500, {
  status: 500,
});
app.listen(5000);
/*
const proto = app.getProto();
const https = require('https');
const fs = require('fs');
const credentials = {
  cert: fs.readFileSync(process.env.SSL_CERT, 'utf8'),
  key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
};
const server = https.createServer(credentials, proto);
server.listen(50000);
*/
