import axios from 'axios'
import React from 'react'
import Teams from './Teams'
import CreateTeam from './CreateTeam'

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



function Header() {
  const [ user, setUser ] = React.useState(null);
  React.useEffect(() => {
    fetchMe().then(user => setUser(user));
  }, []);
  const dom = React.useMemo(() => {
    if(!user) {
      return null;
    }
    return (
      <>
        <h4>안녕하세요. {user.profileName}님!</h4>
        <img src={user.profileImage} alt="profileImage" />
      </>
    );
  }, [ user ]);
  return <>{dom}</>;
}

export default function User() {
  return (
    <div>
      <Header />
      <Teams />
      <CreateTeam />
    </div>
  );
}
