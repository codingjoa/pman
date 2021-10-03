const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Identicon = require('identicon.js');
const maria = require('../loadModules').maria;
const env = require('../loadModules').env;
const { UnauthorizationError } = require('../loadModules').Error;
const { createJWT } = require('./jwt');

const kakao = {
  apiKey: env.APIKEY_KAKAO,
  accountType: 1,
  callbackURI: env.CALLBACK_KAKAO
};

function createTokens(uuid) {
  // accessToken과 refresh 토큰을 생성하여 반환합니다.
  const expiresIn = 60 * 60 * 2; // 2hour
  const accessToken = createJWT(uuid, expiresIn);
  const refreshToken = createJWT(uuid, expiresIn * 2);
  return {
    accessToken, refreshToken, expiresIn: expiresIn * 2 * 1000
  };
}
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
async function isSignUp(
  userAccountID, name, image, type
) {
  const result = await maria('query')('select user.userID, user.userBlocked from user where userAccountID=? and userAccountType=?', [ userAccountID, type ])();
  if(!result[0].length) {
    const { defaultName, profileImageDefault } = await createDefaultProfile();
    const profileName = name ?? defaultName;
    const profileImage = image ?? null;
    const userAccountType = type;
    const userID = await maria('query')('insert into user (userProfileName, userProfileImgDefault, userProfileImg, userAccountID, userAccountType) values (?, ?, ?, ?, ?)', [
      profileName, profileImageDefault, profileImage, userAccountID, userAccountType
    ])(result => {
      if(!result.affectedRows) {
        throw new Error('db 오류');
      }
    })().then(results => results[0].insertId);
    return {
      userID,
      signUp: true
    };
  }
  const userID = result[0][0].userID;
  const userBlocked = result[0][0].userBlocked;
  if(userBlocked) {
    throw new UnauthorizationError('blocked user');
  }
  return {
    userID,
    signUp: false
  };
}

module.exports = {
  createTokens,
  isSignUp,
  kakao
};
