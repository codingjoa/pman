import TeamNavigation from './TeamNavigation'
import BackNavigation from './BackNavigation'
import ScheduleList from './ScheduleList'
import ScheduleListOption from './ScheduleListOption'
import ScheduleDetail from './ScheduleDetail'
import Info from './Info'
import * as ReactRouter from 'react-router-dom'

// bootstrap
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

import { useFetching, useFetched } from 'Hook/useFetching'
import fetchTeam from 'Async/fetchTeam'

function TeamDetail() {
  const team = useFetched();
  return (
    <Container fluid="sm" className="mb-4">
      <Row>
        <Col>
          <h1>{team.teamProfileName}</h1>
          <h5>{team.teamProfileDescription}</h5>
        </Col>
      </Row>
      <Row>
        <Col sm="3" md="3" lg="3" xl="2">
          <ReactRouter.Switch>
            <ReactRouter.Route exact path="/ui/team/:teamID">
              <TeamNavigation />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/schedule/:scheduleID">
              <BackNavigation backUrl={teamID => `/ui/team/${teamID}`} />
            </ReactRouter.Route>
          </ReactRouter.Switch>
        </Col>
        <Col>
          <ReactRouter.Switch>
            <ReactRouter.Route exact path="/ui/team/:teamID">
              <ScheduleList />
              <Info />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/schedule">
              <ScheduleListOption />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/schedule/:scheduleID">
              <ScheduleDetail />
            </ReactRouter.Route>
          </ReactRouter.Switch>
        </Col>
      </Row>
    </Container>
  );
}

export default function Team() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const view = useFetching(TeamDetail, fetchTeam, teamID);
  return <>{view}</>;
}
