const axios = require('axios');
const env = require('../../../loadModules').env;
const kakao = {
  apiKey: env.APIKEY_KAKAO,
  accountType: 1,
  callbackURI: env.CALLBACK_KAKAO
};

module.exports = (app, OauthModel) => {
  class OauthKakao extends OauthModel {
    constructor(req) {
      super(req);
      this.code = req.query?.code;
    }

    async getPayload() {
      const getTokenURI = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${kakao.apiKey}&redirect_uri=${kakao.callbackURI}&code=${this.code}`;
      const tokenRes = await axios({
        url: getTokenURI,
        method: 'GET',
      });
      const access_token = tokenRes.data.access_token;
      const userInfoRes = await axios({
        url: 'https://kapi.kakao.com/v2/user/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
      });
      const payload = userInfoRes.data;
      return {
        userAccountID: `${payload?.id}`,
        userAccountType: kakao.accountType,
        userName: payload?.properties?.nickname,
        userImage: payload?.properties?.profile_image,
      };
    }

    async read(res) {
      const payload = await this.getPayload();
      const user = await this.dao.serialize(async db => {
        return await this.signIn(db, payload) ?? await this.signUp(db, payload);
      });
      const { accessToken, refreshToken, expiresIn } = this.createTokens(user.userID);
      // XSS, CSRF 취약점
      res.cookie('refreshToken', refreshToken, {
        maxAge: expiresIn,
        secure: false,
        httpOnly: true
      });
      res.json({
        accessToken,
        signUp: user.signUp,
      });
    }
  }
  app(OauthKakao);
  app.read();
}
