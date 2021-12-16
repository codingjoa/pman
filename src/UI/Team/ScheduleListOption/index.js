import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

import AddSchedule from '../ScheduleList/AddSchedule'
import List from '../ScheduleList/List'

import fetchSchedulesOption from 'Async/fetchSchedulesOption'

//import { useViewDispatch } from '@/hook'

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
      {schedules?.length ? schedules.map(ScheduleCard) : <div>아무것도 없어요.</div>}
    </>
  );
}

export default function Schedules() {
  const params = ReactRouter.useParams();
  /*
  const view = useViewDispatch({
    effect(state, dispatch) {
      if(state.type === 'pending') {
        fetchSchedulesOption({
          teamID: params.teamID,
          start: state.page,
        }).then(
          data => dispatch({ type: 'fetched', data, })
        )
      }

    },
    view(state, dispatch) {
      if(state.type === 'fetched') {
        return <>
      }
      return <></>;
    }
    initialValue: {
      type: 'pending',
      page: 0,
    },
  });
  return view;
  */
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
