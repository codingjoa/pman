const axios = require('axios');
const fs = require('fs');
const url = process.env.URI;

async function Main() {
  const data = {
    file: Buffer.from(fs.readFileSync('./Read'))
  };
  const option = {
    header : {
      'Content-Type' : 'multipart/form-data'
    }
  };
  axios.post(url, data).then(res => res.data).then(console.log).catch(console.error);
}
Main();
