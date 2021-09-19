const env = require('./environment');
const host = env.MARIADB_HOST;
const port = env.MARIADB_PORT;
const user = 'ky';
const database = env.MARIADB_NAME;
const password = '1234';
const connectionLimit = 5;

module.exports = {
  host,
  port,
  user,
  database,
  password,
  connectionLimit
};
