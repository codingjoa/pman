import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

import AddSchedule from './AddSchedule'
import List from './List'

import { useFetching } from 'Hook/useFetching'
import fetchSchedules from 'Async/fetchSchedules'

function ScheduleCard(row, index) {
  return <div key={index}><List schedule={row} /></div>;
}

function ScheduleTable({
  fetchedData: schedules
}) {
  const params = ReactRouter.useParams();
  return (
    <>
      <div className="line"></div>
      <h1 className="mb-2" id="open-topic">열린 일정</h1>
      <AddSchedule />
      <div className="line"></div>
      {schedules?.length ? schedules.map(ScheduleCard) : '아무것도 없어요.'}
      <ReactRouter.Link
        to={`/ui/team/${params.teamID}/schedule`}
      >
        모든 일정
      </ReactRouter.Link>
    </>
  );
}

function Schedules() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const location = ReactRouter.useLocation();
  const page = useFetching(ScheduleTable, fetchSchedules, {
    teamID
  });
  return <>{page}</>;
}

export default React.memo(Schedules);
