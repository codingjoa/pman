import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

function useQuery() {
  return new URLSearchParams(ReactRouter.useLocation().search);
}
function authorization(token, setRedirectURL) {
  axios(`/api/v1/team/invite?token=${token}`, null)
  .then(r => setRedirectURL(r.data.redirectURL), err => setRedirectURL(undefined));
}

export default function Invite() {
  const query = useQuery();
  const token = query.get('token');
  const [ redirectURL, setRedirectURL ] = React.useState(null);
  const redirect = React.useMemo(() => {
    if(redirectURL === null) {
      return null;
    } else if(redirectURL === undefined) {
      return <>이 초대코드는 유효하지 않습니다.</>
    } else {
      return <ReactRouter.Redirect to={{
        pathname: redirectURL
      }} />
    }
  }, [ redirectURL ]);
  React.useLayoutEffect(() => {
    authorization(token, setRedirectURL);
  }, [ token ]);
  return <>{redirect}</>;
}
