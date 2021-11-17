import React from 'react'
import * as ReactRouter from 'react-router-dom'
import * as Badges from 'Common/Badges'
import * as TimeStamp from 'Common/TimeStamp'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

export default React.memo(function List({
  schedule
}) {
  const params = ReactRouter.useParams();
  const location = ReactRouter.useLocation();
  return (
    <>
      <Row className="mb-1">
        <Col xs={5}>
          <h6><ReactRouter.Link to={{
            pathname: `/ui/team/${params.teamID}/schedule/${schedule.scheduleID}`,
            state: { previous: location.hash }
          }}>#{schedule.scheduleID} {schedule.scheduleName}</ReactRouter.Link></h6>
        </Col>
        <Col xs={2}>
          {schedule.scheduleOwnerUserName}<Badges.MeTag me={!!schedule.isMine} />
        </Col>
        <Col xs={2}>
          <Badges.ScheduleType>{schedule.scheduleType}</Badges.ScheduleType>
          <Badges.Reversion>{schedule.scheduleReversion}</Badges.Reversion>
        </Col>
        <Col xs={3}>
          <div>
            <TimeStamp.Date>{schedule.schedulePublishAt}</TimeStamp.Date>~
            <TimeStamp.Date expiry>{schedule.scheduleExpiryAt}</TimeStamp.Date>
            (<TimeStamp.DDay expiry>{schedule.scheduleExpiryAt}</TimeStamp.DDay>)
          </div>
        </Col>
      </Row>
      <div className="line"></div>
    </>
  );
})
