import ScheduleDetail from './ScheduleDetail'
import ScheduleList from './ScheduleList'
import ScheduleListOption from './ScheduleListOption'
import Settings from './Settings'
import TeamNavigation from './TeamNavigation'
import TeamUsers from './TeamUsers'
import Wiki from './Wiki'
import WikiEdit from './WikiEdit'
import * as ReactRouter from 'react-router-dom'

// bootstrap
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'

import { useFetching, useFetched } from 'Hook/useFetching'
import fetchTeam from 'Async/fetchTeam'

function TeamDetail() {
  const team = useFetched();
  const params = ReactRouter.useParams();
  return (
    <Container fluid="sm" className="mb-4">
      <Row>
        <Col>
          <h1>{team.teamProfileName}</h1>
          <h5>{team.teamProfileDescription}</h5>
        </Col>
      </Row>
      <Row>
        <Nav className="justify-content-center">
          <Nav.Link as={ReactRouter.Link} to={`/ui/team/${params.teamID}`}>
            일정
          </Nav.Link>
          <Nav.Link as={ReactRouter.Link} to={`/ui/team/${params.teamID}/user`}>
            팀원
          </Nav.Link>
          <Nav.Link as={ReactRouter.Link} to={`/ui/team/${params.teamID}/setting`}>
            관리
          </Nav.Link>
        </Nav>
      </Row>
      <Row>
        <Col>
          <ReactRouter.Switch>
            <ReactRouter.Route exact path="/ui/team/:teamID">
              <ScheduleList />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/user">
              <TeamUsers />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/setting">
              <Settings />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/schedule">
              <ScheduleListOption />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/schedule/:scheduleID">
              <ScheduleDetail />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/wiki">
              <Wiki />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/wiki/edit">
              <WikiEdit />
            </ReactRouter.Route>
            <ReactRouter.Route exact path="/ui/team/:teamID/wiki/edit/:wikiID">
              <WikiEdit editmode />
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
