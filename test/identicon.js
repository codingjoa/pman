const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Identicon = require('identicon.js');

async function createIdenticon() {
  const defaultHash = crypto.randomBytes(8).toString('hex');
  const defaultHashBuffer = Buffer.from(defaultHash, 'hex');
  const colorRGB = Array.from(defaultHashBuffer);
  const b64 = new Identicon(defaultHash, {
    foreground: [colorRGB[4], colorRGB[5], colorRGB[6], 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size: 512,
    format: 'png'
  }).toString();
  const b64thumbnail = new Identicon(defaultHash, {
    foreground: [colorRGB[4], colorRGB[5], colorRGB[6], 255],
    background: [255, 255, 255, 255],
    margin: 0.2,
    size: 128,
    format: 'png'
  }).toString();
  const block = path.join(process.cwd(), '/img', defaultHash.replace(/^.*(..)$/, '/$1'));
  const file = path.join(block, `/${defaultHash}.png`);
  const thumbnail = path.join(block, `/${defaultHash}.thumbnail.png`);
  mkdirp(block).then(() => {
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    fs.writeFileSync(thumbnail, Buffer.from(b64thumbnail, 'base64'));
  });

}
