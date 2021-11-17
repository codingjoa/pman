const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Identicon = require('identicon.js');
const env = require('../../loadModules').env;

async function createDefaultProfile() {
  const defaultHash = crypto.randomBytes(8).toString('hex');
  const defaultHashBuffer = Buffer.from(defaultHash, 'hex');
  const defaultName = defaultHash.substring(8);
  const colorRGB = Array.from(defaultHashBuffer);
  const b64 = new Identicon(defaultHash, {
    foreground: [colorRGB[4], colorRGB[5], colorRGB[6], 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size: 512,
    format: 'png'
  }).toString();
  const block = path.join('/img/profile', defaultHash.replace(/^.*(..)$/, '/$1'));
  const file = path.join(block, `/${defaultHash}.png`);
  await mkdirp(path.join(env.ROOT, '/static', block));
  fs.writeFileSync(path.join(env.ROOT, '/static', file), Buffer.from(b64, 'base64'));
  return {
    defaultName,
    profileImageDefault: file
  };
}

module.exports = (app, Model) => {
  class OauthModel extends Model {
    createTokens(id) {
      // accessToken과 refresh 토큰을 생성하여 반환합니다.
      const expiresIn = 60 * 60 * 2; // 2hour
      const accessToken = this.jwt.createJWT({ id }, expiresIn);
      const refreshToken = this.jwt.createJWT({ id }, expiresIn * 2);
      return {
        accessToken, refreshToken, expiresIn: expiresIn * 2 * 1000
      };
    }

    async signIn(db, payload) {
      const users = await db.get('select user.userID, user.userBlocked from user where userAccountID=? and userAccountType=?', [
        payload.userAccountID, payload.userAccountType
      ]);
      if(!users[0]) {
        return;
      }
      if(users[0].userBlocked) {
        throw new Error('403 blocked user');
      }
      return {
        userID: users[0].userID,
        signUp: false
      };
    }

    async signUp(db, payload) {
      const { defaultName, profileImageDefault } = await createDefaultProfile();
      const profileName = payload.profileName ?? defaultName;
      const profileImage = payload.profileImage ?? null;
      const result = await db.run('insert into user (userProfileName, userProfileImgDefault, userProfileImg, userAccountID, userAccountType) values (?, ?, ?, ?, ?)', [
        profileName, profileImageDefault, profileImage, payload.userAccountID, payload.userAccountType
      ]);
      if(!result.affectedRows) {
        throw new Error('db 오류');
      }
      return {
        userID: result.lastID,
        signUp: true,
      };
    }
  }
  app(OauthModel);
  app.child('/kakao', require('./kakao'));
  app.child('/refresh', require('./refresh'));
}
