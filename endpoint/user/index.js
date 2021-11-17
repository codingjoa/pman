module.exports = (app, Model) => {
  class UserModel extends Model {
    constructor(req) {
      super(req);
      this.profileName = req.body?.profileName;
    }

    async read(res) {
      this.isAuthorized();
      await this.dao.serialize(async db => {
        const users = await db.get('select * from user where user.userID=?', [
          this.requestUserID
        ]);
        if(!users[0]) {
          throw new Error('403 권한 없음');
        }
        res.json({
          userID: this.requestUserID,
          profileName: users[0].userProfileName,
          profileImage: users[0]?.userProfileImg ?? users[0].userProfileImgDefault
        });
      });
    }

    async patch(res) {
      this.isAuthorized();
      this.checkParameters(this.profileName);
      await this.dao.serialize(async db => {
        const result = await db.run('update user set userProfileName=? where userID=?', [
          this.profileName, this.requestUserID
        ])
        if(!result.affectedRows) {
          throw new Error('403 권한 없음');
        }
        res.json({
          complete: true
        });
      });

    }
  }
  app(UserModel);
  app.read();
  app.patch();
}
