const essential = require('./loadModules').app;
// deprecated
const Make2Model = require('./loadModules').Make2Model;

const Model = require('./endpoint/model');
const app = essential(builder => {
  const api = builder('/api/v1');
  Make2Model(api, '/', null, require('./endpoint/route'));
}, errorHandlar => {
  errorHandlar.addErrorType(Model.Error400Parameter, {
    status: 400,
    message: 'INVALID_PARAMETER',
  })
  .addErrorType(Model.Error400, {
    status: 400,
  })
  .addErrorType(Model.Error401, {
    status: 401,
    message: 'UNAUTHORIZED',
  })
  .addErrorType(Model.Error403, {
    status: 403,
    message: 'FORBIDDEN',
  })
  .addErrorType(Model.Error404, {
    status: 404,
    message: 'NOT_FOUND',
  })
  .addErrorType(Model.Error500, {
    status: 500,
  });
});
app.listen(5000);
