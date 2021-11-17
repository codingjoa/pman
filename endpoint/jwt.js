const jwt = require('jsonwebtoken');
const key = 'development';
const iss = 'development';
function createJWT(payloads, expiresIn) {
  const iat = Date.now() / 1000;
  const payload = {
    ...payloads,
    iss, // 발행자
    iat,
    exp: iat + expiresIn,
    //roles: ['read'],
  };
  const token = jwt.sign(payload, key, {
    algorithm: 'HS256',
  });
  return token;
}
function validateJWT(token) {
  const payload = jwt.verify(token, 'development', {
    algorithms: ['HS256'],
  });
  return payload;
}

module.exports = {
  createJWT, validateJWT
};
