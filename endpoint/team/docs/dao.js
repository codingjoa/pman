const TeamDAO = require('../dao');
const path = require('path');
const ROOT = process.cwd();
class TeamDocsDAO extends TeamDAO {
  constructor(req) {
    super(req);

    this.documentID = req.params?.documentID;
  }

  async create(res) {
    // 토큰 권한 확인
    res.status(504);
    res.json({
      message: "not Implement"
    });
    /*
    this.isAuthorized();

    // 본 작업
    this.checkParameters(this.teamProfileName, this.teamProfileDescription);
    return this.query('insert into team(teamOwnerUserID, teamProfileName, teamProfileDescription) values (?, ?, ?)', [
      this.requestUserID, this.teamProfileName, this.teamProfileDescription
    ])(result => {
      return {
        teamID: result.lastID
      };
    })('insert into teamMember(teamID, userID) values (LAST_INSERT_ID(), ?)', [
      this.requestUserID
    ])((result, storage) => {
      const teamID = storage.teamID;
      res.status(201);
      res.json({
        teamID
      });
    })();
    */
  }

  async read(res) {
    // 토큰 권한 확인
    this.isAuthorized();

    // 해당 팀의 uuid를 구한다.
    // uuid 값으로 leveldb를 연다
    /*


    */
    const db = this.level(path.join(ROOT, 'leveldb', 'test'));
    const map = { a:1, b:2, c:3 };
    await db.put('foo', JSON.stringify(map));
    return (async () => {
      const foo = await db.get('foo');
      res.json(JSON.parse(foo));
    })();
  }
}
module.exports = TeamDocsDAO;
