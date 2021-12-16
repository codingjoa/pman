import axios from 'axios'
import * as ReactRouter from 'react-router-dom'
import Button from 'react-bootstrap/Button'

async function deleteTeam({
  teamID
}) {
  await axios({
    method: 'DELETE',
    url: `/api/v1/team/${teamID}`,
    validateStatus: status => status === 200,
  });
}

export default function DeleteTeam() {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const accept = () => {
    const ok = window.confirm('팀을 삭제합니다. (복구할 수 없습니다.)');
    if(!ok) {
      return;
    }
    deleteTeam({
      teamID: params.teamID
    }).then(() => {
      history.push('/ui/user');
    });
  };
  return (
    <>
      <Button onClick={accept}>팀 삭제</Button>
    </>
  );
}
