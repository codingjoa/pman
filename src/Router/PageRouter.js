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

export default function PageRouter({
  authorized
}) {
  const view = React.useMemo(() => {
    if(authorized === true) {
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
    } else if(authorized === false) {
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
      return <>잠시만 기다려 주세요.</>;
    }
  }, [ authorized ]);
  return view;
}
