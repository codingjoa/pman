const { createTokens } = require('./oauth');
const { validateJWT } = require('./jwt');
const { UnauthorizationError } = require('../loadModules').Error;

module.exports = {
  Read(req, res) {
    const oldRefreshToken = req.cookies?.refreshToken;
    if(oldRefreshToken) {
      const userID = validateJWT(oldRefreshToken);
      const { accessToken, refreshToken, expiresIn } = createTokens(userID);
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
