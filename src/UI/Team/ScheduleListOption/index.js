import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

import AddSchedule from '../ScheduleList/AddSchedule'
import List from '../ScheduleList/List'

import fetchSchedulesOption from 'Async/fetchSchedulesOption'

function ScheduleCard(row, index) {
  return <div key={index}><List schedule={row} /></div>;
}

function ScheduleTable({
  fetchedData: schedules
}) {
  return (
    <>
      <div className="line"></div>
      <h1 className="mb-2" id="open-topic">모든 일정</h1>
      <AddSchedule />
      <div className="line"></div>
      {schedules?.length ? schedules.map(ScheduleCard) : '아무것도 없어요.'}
    </>
  );
}

function Schedules() {
  const params = ReactRouter.useParams();
  const [ index, setIndex ] = React.useState(0);
  const [ data, setData ] = React.useState(null);
  const effect = async () => {
    const data = await fetchSchedulesOption({
      teamID: params.teamID,
      start: index
    });
    setData(data);
  };
  const view = React.useMemo(() => {
    console.log(data);
    if(data === null) {
      return null;
    } else if(data === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <ScheduleTable fetchedData={data.schedules} index={index} setIndex={setIndex} />
    }
  }, [ data ]);
  React.useLayoutEffect(() => {
    effect();
    //fetchScheduleComments(teamID, scheduleID, index, setData);
  }, [ index ]);
  return <>{view}</>;
}

export default React.memo(Schedules);
