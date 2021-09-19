const { createTokens } = require('./oauth');
const { validateJWT } = require('../server/jwt');
const { UnauthorizationError } = require('../server/Types/Error');

module.exports = {
  Read(req, res) {
    const oldRefreshToken = req.cookies?.refreshToken;
    if(oldRefreshToken) {
      const uuid = validateJWT(oldRefreshToken);
      const { accessToken, refreshToken, expiresIn } = createTokens(uuid);
      // XSS, CSRF 취약점
      res.cookie('refreshToken', refreshToken, {
        maxAge: expiresIn,
        secure: false,
        httpOnly: true
      });
      //res.set('Set-Cookie', refreshToken);
      res.json({
        accessToken
      });
    } else {
      throw new UnauthorizationError('token miss');
    }
  }
};
