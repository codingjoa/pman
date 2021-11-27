module.exports = (app, TeamDetailModel) => {
  class TeamWikiModel extends TeamDetailModel {
    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const wiki = await db.get('select * from teamWiki where teamWiki.teamID=? order by teamWiki.wikiTitle asc', [
          this.teamID
        ]);
        res.json({
          _meta: null,
          list: wiki,
        });
      });
    }
  }
  app(TeamWikiModel);
  app.read();
  app.child('/:wikiID', require('./detail'));
}
