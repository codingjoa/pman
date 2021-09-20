const axios = require('axios');


async function main() {
  const accessToken = process.env.ACCESS_TOKEN;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  axios.patch('http://txshi.iptime.org:50080/api/v1/user/me/', {
    profileName: '택현'
  }).then(r => console.log(r.data), err => console.error(err));
}

main();
