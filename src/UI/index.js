import React from 'react';
import * as ReactRouter from 'react-router-dom'

import User from './User'
import Team from './Team'

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'css/share.css'
import Container from 'react-bootstrap/Container'

function UI() {
  return (
    <Container>
      <Container className="mt-4">
      <ReactRouter.Switch>
        <ReactRouter.Route exact path="/ui/user">
          <User />
        </ReactRouter.Route>
        <ReactRouter.Route path="/ui/team/:teamID">
          <Team />
        </ReactRouter.Route>
      </ReactRouter.Switch>
      </Container>
    </Container>
  );
}

export default React.memo(UI);

/*
<Container fluid="sm">
  <Row>

  </Row>
  <Row>
    <Col sm="3">
      <ReactRouter.BrowserRouter>
        <ReactRouter.Route path="/team/:teamID">
          <Detail />
        </ReactRouter.Route>
      </ReactRouter.BrowserRouter>
    </Col>
    <Col sm="9">
      <ReactRouter.Switch>
        <ReactRouter.Route exact path="/team/:teamID">
          <Schedules />
        </ReactRouter.Route>
        <ReactRouter.Route exact path="/team/:teamID/schedule/:scheduleID">
          <ScheduleDetail />
        </ReactRouter.Route>
      </ReactRouter.Switch>
    </Col>
  </Row>
</Container>
*/
