//const axios = require('axios');
//const except = require('chai').except;
const supertest = require('supertest');
/*
async function main() {
  const accessToken = process.env.ACCESS_TOKEN;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  const res = await axios.patch('http://txshi.iptime.org:50080/api/v1/user/me/', {
    profileName: '택현'
  });
  except(res.status).to.equal(200);
}
*/
const request = supertest('http://127.0.0.1:5000');

describe('GET /user/me', done => {
  it('프로필 얻기', () => {
    request.get('/user/me').expect(200, done);
  });
});
