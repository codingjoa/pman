import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'
import { authorization } from '@/ajax'

function useQuery() {
  return new URLSearchParams(ReactRouter.useLocation().search);
}

export default function OAuth2() {
  const query = useQuery();
  const code = query.get('code');
  const [ token, setToken ] = React.useState(null);
  const view = React.useMemo(() => {
    if(token === null) {
      return null;
    } else if(token === false) {
      return <>로그인 실패.</>
    } else {
      return <ReactRouter.Redirect to="/" />
    }
  }, [ token ]);
  React.useLayoutEffect(() => {
    authorization({ code }).then(() => setToken(true), () => setToken(false));
  }, [ code ]);
  return <>{view}</>;
}
