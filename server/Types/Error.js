class CommonError extends Error {}
class NotFoundError extends Error {}
class UnauthorizationError extends Error {
  constructor(...param) {
    super(...param);
    if(!param.length) {
      this.message = 'token undefined error';
    }
  }
}
class ForbiddenError extends Error {}

module.exports = {
  CommonError,
  ForbiddenError,
  NotFoundError,
  UnauthorizationError
}
