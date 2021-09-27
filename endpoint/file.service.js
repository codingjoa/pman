module.exports = {
  Create(req, res, next) {
    console.log(req?.body);
    res.send(req?.body);
  }
};
