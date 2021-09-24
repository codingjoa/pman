const path = require('path');
const ROOT = process.cwd();
const PORT = process.env.PORT ?? 3307;
const PROXY = process.env.PROXY ?? false;
const MARIADB = process.env.MARIADB ?? false;
const SQLITE = process.env.SQLITE ?? false;
const JWT = process.env.JWT ?? false;
const SESSION = process.env.SESSION ?? false;
const MARIADB_HOST = process.env.MARIADB_HOST ?? 'localhost';
const MARIADB_PORT = process.env.MARIADB_PORT ?? 3306;
const MARIADB_NAME = process.env.MARIADB_NAME ?? 'react';
const SQLITE_DIR = path.join((process.env.SQLITE_DIR ?? ROOT), './Sqlite3');
const kakao = process.env.APIKEY_KAKAO && require(path.join(ROOT, process.env.APIKEY_KAKAO));
const APIKEY_KAKAO = kakao?.apiKey;
const CALLBACK_KAKAO = kakao?.callbackURI;
const FRONT_DOMAIN = process.env.FRONT_DOMAIN ?? 'localhost';

module.exports = {
  ROOT, PORT,
  PROXY, MARIADB, SQLITE, JWT, SESSION,
  MARIADB_HOST, MARIADB_PORT, MARIADB_NAME, SQLITE_DIR,
  APIKEY_KAKAO, CALLBACK_KAKAO, FRONT_DOMAIN
}
