import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

function useQuery() {
  return new URLSearchParams(ReactRouter.useLocation().search);
}
function authorization(code, setToken) {
  axios(`/api/v1/oauth/kakao?code=${code}`, null, {
    withCredentials: true
  })
  .then(r => setToken(r.data.accessToken), err => setToken(undefined));
}

export default function OAuth2() {
  const query = useQuery();
  const code = query.get('code');
  const [ token, setToken ] = React.useState(null);
  const redirect = React.useMemo(() => {
    if(token === null) {
      return null;
    } else if(token === undefined) {
      return <>로그인 실패.</>
    } else {
      return <ReactRouter.Redirect to={{
        pathname: "/",
        state: { accessToken: token }
      }} />
    }
  }, [ token ]);
  React.useLayoutEffect(() => {
    authorization(code, setToken);
  }, [ code ]);
  return <>{redirect}</>;
}
