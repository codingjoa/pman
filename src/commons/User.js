import axios from 'axios'
import * as AccessToken from './AccessToken'
import React from 'react'
async function fetchMe(getAccessToken) {
  /*
  axios('/api/v1/user/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  */
  const r = await axios('/api/v1/user/me');
  return r.data;
}



export default function User() {
  const promise = AccessToken.useAccessToken();
  const [ user, setUser ] = React.useState(null);
  React.useEffect(() => {
    promise.then(fetchMe).then(user => setUser(user));
  }, []);
  const dom = React.useMemo(() => {
    if(!user) {
      return null;
    }
    return (
      <>
        <h4>안녕하세요. {user?.profileName}님!</h4>
        <img src={user?.profileImage} />
      </>
    );
  }, [ user ]);
  return <>{dom}</>;
}
