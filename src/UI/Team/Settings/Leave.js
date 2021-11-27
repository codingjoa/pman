import axios from 'axios'
import * as ReactRouter from 'react-router-dom'

async function leave({
  teamID,
}) {
  await axios({
    method: 'DELETE',
    url: `/api/v1/team/${teamID}/user/me`,
  });
}


export default function Leave() {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const handleClick = () => {
    const ok = window.confirm('팀을 탈퇴합니다. (일정이 모두 삭제됩니다.)');
    if(!ok) {
      return;
    }
    leave({
      teamID: params.teamID,
    }).then(() => {
      history.push('/ui/user');
    });
  };
  return (
    <>
      <button onClick={handleClick}>팀 탈퇴</button>
    </>
  );
}
