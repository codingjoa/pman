import React from 'react'
import * as ReactRouter from 'react-router-dom'
import * as AccessToken from './AccessToken'
import App from './App'
import User from './User'

export default function PageRouter() {
  // promise가 끝나기 전까지는 화면을 뿌리면 안되기 때문에 state nul로 ㅁㄴㅇ
  const [ redirect, setRedirect ] = React.useState(null);
  const promise = AccessToken.useAccessToken();
  React.useLayoutEffect(() => {
    // Promise가 끝남은 AccessToken 재발급 과정을 포함합니다.
    promise.then(getAccessToken => {
      getAccessToken() ? setRedirect(
        <ReactRouter.Switch>
          <ReactRouter.Route exact path="/">
            <User />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/app">
            <App />
          </ReactRouter.Route>
          <ReactRouter.Route exact path="/user">
            <User />
          </ReactRouter.Route>
          <ReactRouter.Route path="*">
            404 Not Found
          </ReactRouter.Route>
        </ReactRouter.Switch>
      ) : setRedirect(
        <ReactRouter.Redirect
          to={{ pathname: "/login" }}
        />
      );
    });
  }, []);
  return redirect;
}
