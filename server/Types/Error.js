class CommonError extends Error {}
class NotFoundError extends Error {}
class UnauthorizationError extends Error {}
class ForbiddenError extends Error {}

module.exports = {
  CommonError,
  ForbiddenError,
  NotFoundError,
  UnauthorizationError
}
