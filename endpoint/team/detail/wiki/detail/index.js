module.exports = (app, TeamWikiModel) => {
  class TeamWikiDetailModel extends TeamWikiModel {
    constructor(req) {
      super(req);
      this.wikiID = req.params?.wikiID;
      this.wikiTitle = req.body?.wikiTitle;
      this.wikiContent = req.body?.wikiContent;
    }

    async read(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.wikiID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const wiki = await db.get('select * from teamWiki where teamWiki.teamID=? and teamWiki.wikiID=?', [
          this.teamID, this.wikiID
        ]);
        if(!wiki[0]) {
          throw new TeamWikiDetailModel.Error404();
        }
        res.json(wiki[0]);
      });
    }

    async update(res) {
      this.isAuthorized();
      this.checkParameters(this.wikiTitle, this.wikiContent, this.teamID, this.wikiID);
      await this.dao.serialize(async db => {
        await this.checkReadPermissions(db);
        const result = await db.run('update teamWiki set teamWiki.wikiTitle=?, teamWiki.wikiContent=? where teamWiki.teamID=? and teamWiki.wikiID=?', [
          this.wikiTitle, this.wikiContent, this.teamID, this.wikiID
        ]);
        if(!result.affectedRows) {
          throw new TeamWikiDetailModel.Error403();
        }
        res.json(wiki[0]);
      });
    }

    async delete(res) {
      this.isAuthorized();
      this.checkParameters(this.teamID, this.wikiID);
      await this.dao.serialize(async db => {
        await this.checkDeletePermissions(db);
        const result = await db.run('delete from teamWiki where teamWiki.teamID=? and teamWiki.wikiID=?', [
          this.teamID, this.wikiID
        ]);
        if(!result.affectedRows) {
          throw new TeamWikiDetailModel.Error403();
        }
        res.json({
          complete: true,
        });
      });
    }
  }
  app(TeamWikiDetailModel);
  app.read();
}
