import React from 'react'
import * as ReactRouter from 'react-router-dom'
import * as AccessToken from './AccessToken'
/*
import App from './App'
import Team from './User/Team'
import TeamDetail from './User/TeamDetail'

*/
import UI from 'UI'
import Action from 'Action'
import Login from 'UnauthUI/Login'
import Invite from 'Action/Invite'
import OAuth2 from 'Action/OAuth2'

export default function PageRouter() {
  // promise가 끝나기 전까지는 화면을 뿌리면 안되기 때문에 state nul로 ㅁㄴㅇ
  const [ view, setView ] = React.useState(null);
  const promise = AccessToken.useAccessToken();
  React.useLayoutEffect(() => {
    // Promise가 끝남은 AccessToken 재발급 과정을 포함합니다.
    promise.then(getAccessToken => {
      getAccessToken() ? setView(
        <ReactRouter.Switch>
          <ReactRouter.Route exact path="/">
            <ReactRouter.Redirect
              to={{ pathname: "/ui/user" }}
            />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/action/*">
            <Action />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/ui/*">
            <UI />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/oauth">
            <ReactRouter.Redirect
              to={{ pathname: "/ui/user" }}
            />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/login">
            <ReactRouter.Redirect
              to={{ pathname: "/ui/user" }}
            />
          </ReactRouter.Route>
          <ReactRouter.Route path="*">
            404 Not Found
          </ReactRouter.Route>
        </ReactRouter.Switch>
      ) : setView(
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
      );
    });
  }, []);
  return view;
}


/*
<ReactRouter.Route exact path="/">
  <User />
</ReactRouter.Route>
<ReactRouter.Route exact path="/app">
  <App />
</ReactRouter.Route>

<ReactRouter.Route exact path="/team">
  <Team />
</ReactRouter.Route>
<ReactRouter.Route path="/team/*">
  <TeamDetail />
</ReactRouter.Route>
<ReactRouter.Route exact path="/action/invite">
  <Invite />
</ReactRouter.Route>
*/
