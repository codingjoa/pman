const axios = require('axios');
const except = require('chai').except;
async function main() {
  const accessToken = process.env.ACCESS_TOKEN;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  const res = await axios.patch('http://txshi.iptime.org:50080/api/v1/user/me/', {
    profileName: '택현'
  });
  except(res.status).to.equal(200);
}

describe('api.v1.user.me', () => {
  it('patch: profileName', done => {
    main().then(done, done);
  })
});
