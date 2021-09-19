const jwt = require('jsonwebtoken');
// const key
const iss = 'development'
function createJWT(
  id, expiresIn
) {
  const iat = Date.now() / 1000;
  const payload = {
    iss, // 발행자
    iat,
    exp: iat + expiresIn,
    id
    //roles: ['read']
  };
  const token = jwt.sign(payload, 'development', {
    algorithm: 'HS256'
  });
  return token;
}
function validateJWT(token) {
  const payload = jwt.verify(token, 'development', {
    algorithms: ['HS256']
  });
  return payload.id;
}

module.exports = {
  createJWT, validateJWT
};
