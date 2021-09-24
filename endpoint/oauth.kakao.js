const axios = require('axios');
const {
  kakao,
  isSignUp,
  createTokens
} = require('./oauth');

module.exports = {
  Read(req, res, next) {
    //GET /api/v1/oauth/kakao
    const code = req.query?.code;
    const getTokenURI = `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${kakao.apiKey}&redirect_uri=${kakao.callbackURI}&code=${code}`;
    axios.get(getTokenURI)
    .then(res => res.data.access_token)
    .then(access_token => {
      return axios.get('https://kapi.kakao.com/v2/user/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
    })
    .then(res => res.data)
    .then(async body => {
      const id = body?.id;
      const userAccountID = `${id}`;
      const { userID, signUp, profile } = await isSignUp(
        userAccountID,
        body?.properties?.nickname,
        body?.properties?.profile_image,
        kakao.accountType
      );
      const { accessToken, refreshToken, expiresIn } = createTokens(userID);
      // XSS, CSRF 취약점
      res.cookie('refreshToken', refreshToken, {
        maxAge: expiresIn,
        secure: false,
        httpOnly: true
      });
      //res.set('Set-Cookie', refreshToken);
      res.json({
        accessToken,
        signUp
      });
    })
    .catch(err => next(err));
  }
};
