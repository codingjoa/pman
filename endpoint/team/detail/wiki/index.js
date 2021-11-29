module.exports = (app, TeamDetailModel) => {
  class TeamWikiModel extends TeamDetailModel {
    constructor(req) {
      super(req);
      this.wikiTitle = req.body?.wikiTitle;
      this.wikiContent = req.body?.wikiContent;
    }
    async create(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.wikiTitle, this.wikiContent);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const result = await db.run('insert into teamWiki (teamID, wikiTitle, wikiContent) values (?, ?, ?)', [
          this.teamID, this.wikiTitle, this.wikiContent
        ]);
        if(!result.affectedRows) {
          throw new TeamWikiModel.Error403();
        }
        res.status(201).json({
          wikiID: result.lastID,
        });
      });
    }
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
  app.create();
  app.read();
  app.child('/:wikiID', require('./detail'));
}
