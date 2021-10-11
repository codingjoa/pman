import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

async function fetchSchedules(teamID, setState) {
  try {
    const result = await axios.get(`/api/v1/team/${teamID}/schedule`);
    setState(result.data?.fetchResult?.schedules);
  } catch(err) {
    setState(undefined);
  }
}

function ScheduleTable({
  schedules,
  teamID
}) {
  return schedules instanceof Array ? schedules.map((row, index) =>
    <div key={index}>
      <ReactRouter.Link
        to={`/team/${teamID}/schedule/${row.scheduleID}`}
      ><h3>{row.scheduleName}</h3></ReactRouter.Link>
      <h5>{row.scheduleOwnerUserName}</h5>
      <h6>{row.schedulePublishAt}~{row.scheduleExpiryAt}</h6>
      {JSON.stringify(row)}
    </div>
  ) : null;
}

export default function Schedules() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const [ schedules, setSchedules ] = React.useState(null);
  const page = React.useMemo(() => {
    if(schedules === null) {
      return null;
    } else if(schedules === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <ScheduleTable teamID={teamID} schedules={schedules} />
    }
  }, [ schedules ]);
  React.useLayoutEffect(() => {
    fetchSchedules(teamID, setSchedules);
  }, []);
  return <>{page}</>;
}
