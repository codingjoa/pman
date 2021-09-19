
module.exports = {
  Create: (req, res) => {
    //const access_token = JWTpublish('key...', 'id', 3600);
    //const refresh_token = JWTpublish('key...', 'id', 1209600);
    //  header('Authorization: Bearer '.$access_token);
    res.send('account Created');
  },
  Read: (req, res) => {
    res.send('account Read');
  }
}
