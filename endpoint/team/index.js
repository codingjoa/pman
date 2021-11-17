module.exports = (app, Model) => {
  class TeamModel extends Model {
    constructor(req) {
      super(req);
      this.teamID = req.params?.teamID - 0;

      this.teamProfileName = req.body?.teamProfileName;
      this.teamProfileDescription = req.body?.teamProfileDescription;
    }

    async create(res) {
      this.isAuthorized();
      this.checkParameters(
        this.teamProfileName,
        this.teamProfileDescription
      );
      await this.dao.serialize(async db => {
        const result = await db.run('insert into team(teamOwnerUserID, teamProfileName, teamProfileDescription) values (?, ?, ?)', [
          this.requestUserID, this.teamProfileName, this.teamProfileDescription
        ]);
        await db.run('insert into teamMember(teamID, userID) values (LAST_INSERT_ID(), ?)', [
          this.requestUserID
        ]);
        res.status(201);
        res.json({
          complete: true
        });
      });
    }

    async read(res) {
      this.isAuthorized();
      await this.dao.serialize(async db => {
        const rows = await db.get(
          `select
            team.teamID,
            team.teamCreatedAt,
            team.teamProfileName,
            team.teamProfileImg,
            case team.teamOwnerUserID
              when teamMember.userID
              then 1
              else 0
            end as isOwn
          from
            team left join teamMember on
              team.teamID=teamMember.teamID
          where
            teamMember.userID=?`,[
            this.requestUserID
          ]
        );
        res.json(rows);
      });
    }
  }
  app(TeamModel);
  app.create();
  app.read();
  app.child('/:teamID', require('./detail'));
  app.child('/invite', require('./invite'));
}
