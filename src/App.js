import * as ReactRouter from 'react-router-dom'
import AccessToken from './commons/AccessToken'
import Login from './commons/Login'
import OAuth2 from './commons/OAuth2'

export default function App() {
  return (
    <ReactRouter.BrowserRouter>
      <ReactRouter.Switch>
        <ReactRouter.Route exact path="/oauth">
          <OAuth2 />
        </ReactRouter.Route>
        <ReactRouter.Route exact path="/login">
          <Login />
        </ReactRouter.Route>
        <ReactRouter.Route path="*">
          <AccessToken />
        </ReactRouter.Route>
      </ReactRouter.Switch>
    </ReactRouter.BrowserRouter>
  );
}
