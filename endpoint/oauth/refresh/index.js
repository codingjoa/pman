module.exports = (app, OauthModel) => {
  class OauthRefresh extends OauthModel {
    constructor(req) {
      super(req);
      this.refreshToken = req.cookies?.refreshToken;
    }

    async read(res) {
      if(!this.refreshToken) {
        throw new OauthRefresh.Error403();
      }
      // 토큰 생성
      const { id: userID } = this.jwt.validateJWT(this.refreshToken);
      const { accessToken, refreshToken, expiresIn } = this.createTokens(userID);
      // XSS, CSRF 취약점
      res.cookie('refreshToken', refreshToken, {
        maxAge: expiresIn,
        secure: true,
        httpOnly: true
      });
      res.json({
        accessToken
      });
    }
  }
  app(OauthRefresh);
  app.read();
}
