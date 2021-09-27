import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

async function fetchTeams(setState) {
  try {
    const result = await axios.get('/api/v1/team');
    setState(result.data.teams);
  } catch(err) {
    setState(undefined);
  }
}

function TeamList({
  teams
}) {
  return <>
    {teams.map(row => <>
      <h3>{row.teamID}</h3><br />
      <p>팀 이름: {row.teamProfileName}</p>
      <p>주인: {row.isOwn}</p>
    </>)}
  </>
}

export default function Team() {
  const [ teams, setTeams ] = React.useState(null);
  const page = React.useMemo(() => {
    if(teams === null) {
      return null;
    } else if(teams === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <TeamList teams={teams} />
    }
  }, [ teams ]);
  React.useLayoutEffect(() => {
    fetchTeams(setTeams);
  }, []);
  return <>{page}</>;
}
