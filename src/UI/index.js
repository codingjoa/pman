import * as ReactRouter from 'react-router-dom'

// bootstrap
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import Invite from 'Action/Invite'
import MyInfo from './MyInfo'
import TeamList from './TeamList'
import Team from './Team'

export default function UI() {
  return (
    <Container className="mt-4">
      <Row>
        <Col xs="3">
          <MyInfo />
        </Col>
        <Col>
          <ReactRouter.Switch>
            <ReactRouter.Route path="/oauth">
              <ReactRouter.Redirect
                to={{ pathname: "/ui/team" }}
              />
            </ReactRouter.Route>
            <ReactRouter.Route path="/login">
              <ReactRouter.Redirect
                to={{ pathname: "/ui/team" }}
              />
            </ReactRouter.Route>
            <ReactRouter.Route path="/invite">
              <Invite />
            </ReactRouter.Route>
            <ReactRouter.Route path="/ui/team/:teamID">
              <Team />
            </ReactRouter.Route>
            <ReactRouter.Route path="/ui/team">
              <TeamList />
            </ReactRouter.Route>
            <ReactRouter.Route path="/">
              <ReactRouter.Redirect
                to={{ pathname: "/ui/team" }}
              />
            </ReactRouter.Route>
            <ReactRouter.Route path="*">
              404 Not Found
            </ReactRouter.Route>
          </ReactRouter.Switch>
        </Col>
      </Row>
    </Container>
  );
}
