const axios = require('axios');
const accessToken = process.env.ACCESS_TOKEN;
const url = process.env.URI;
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

async function Main() {
  let body = '';
  for await(const line of process.stdin) {
    body += line;
  }
  const json = JSON.parse(body);
  axios.patch(url, json).then(res => res.data).then(console.log).catch(console.error);
}
Main();
