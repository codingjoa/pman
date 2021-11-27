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

  //const [ view, setView ] = React.useState(null);
  // Promise가 끝남은 AccessToken 재발급 과정을 포함합니다.
  const state = AccessToken.useAuthorized();
  const view = React.useMemo(() => {
    if(state === true) {
      return <ReactRouter.Switch>
        <ReactRouter.Route exact path="/">
          <ReactRouter.Redirect
            to={{ pathname: "/ui/user" }}
          />
        </ReactRouter.Route>
        <ReactRouter.Route path="/action/invite">
          <Invite />
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
      </ReactRouter.Switch>;
    } else if(state === false) {
      return <ReactRouter.Switch>
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
      </ReactRouter.Switch>;
    } else {
      // promise가 끝나기 전까지는 화면을 뿌리면 안되기 때문에 state null로
      return null;
    }
  }, [ state ]);
  /*
  React.useLayoutEffect(() => {

    promise.then(getAccessToken => {
      getAccessToken() ? setView(

      ) : setView(

      );
    });
  }, []);
  */
  return view;
}
