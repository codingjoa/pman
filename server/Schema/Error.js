const { CommonError, ForbiddenError, NotFoundError, UnauthorizationError } = require('../Types/Error');

function getStatusCode(err) {
  try {
    if(err instanceof CommonError) {
      // API
      return 400;
    } else if(err instanceof NotFoundError) {
      return 404;
    } else if(err instanceof UnauthorizationError) {
      return 401;
    } else if(err instanceof ForbiddenError) {
      return 403;
    } else {
      // 내부에서 발생할 수 있는 모든 오류를 http 500으로 처리함
      return 500;
    }
  } catch(err) {
    return 500;
  }
}

module.exports = err => {
  const message = (err?.message !== undefined && err.message !== '') ? err.message :  'undefined error';
  return {
    status: getStatusCode(err),
    message
  };
}
module.id === require.main.id && (() => {
  console.log(
    module.exports(new Error('general Error')),
    module.exports(new CommonError('common Error'))
  );
})();
