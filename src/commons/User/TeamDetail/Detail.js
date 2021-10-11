import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

async function fetchTeam(teamID, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}`);
    setState(result.data);
  } catch(err) {
    setState(undefined);
  }
}

function TeamDetailInfo({
  team
}) {
  return <>
    <h3>팀 이름: {team.teamProfileName}</h3><br />
    <p>{team.teamOwnerUserName}의 팀</p>
    <h6>팀원 이름</h6>
    <ul>{team.users.map(row => <>
      <li>{row.userProfileName}</li>
    </>)}</ul>
  </>
}

export default function TeamDetail() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const [ team, setTeam ] = React.useState(null);
  const page = React.useMemo(() => {
    if(team === null) {
      return null;
    } else if(team === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <TeamDetailInfo team={team} />
    }
  }, [ team ]);
  React.useLayoutEffect(() => {
    fetchTeam(teamID, setTeam);
  }, []);
  return <>{page}</>;
}
