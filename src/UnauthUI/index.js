import * as ReactRouter from 'react-router-dom'

import Container from 'react-bootstrap/Container'

import Login from './Login'
import OAuth2 from 'Action/OAuth2'

export default function UnauthUI() {
  return <Container className="mt-4">
    <ReactRouter.Switch>
      <ReactRouter.Route exact path="/oauth">
        <OAuth2 />
      </ReactRouter.Route>
      <ReactRouter.Route exact path="/login">
        <Login />
      </ReactRouter.Route>
      <ReactRouter.Route path="*">
        <ReactRouter.Redirect
          to={{ pathname: "/login" }}
        />
      </ReactRouter.Route>
    </ReactRouter.Switch>
  </Container>
}
