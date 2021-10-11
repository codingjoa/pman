import Detail from './Detail'
import Schedules from './Schedules'
import ScheduleDetail from './ScheduleDetail'
import * as ReactRouter from 'react-router-dom'

// bootstrap
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

export default function TeamDetail() {
  return (
    <Container>
      <Row>
        내비게이션
      </Row>
      <Row>
        <ReactRouter.Switch>
          <ReactRouter.Route exact path="/team/:teamID">
            <Detail />
            <Schedules />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/team/:teamID/schedule/:scheduleID">
            <ScheduleDetail />
          </ReactRouter.Route>
        </ReactRouter.Switch>
      </Row>
    </Container>
  );
}
