import { TeamEditPreset } from 'Common/Preset'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'

async function createTeam({
  teamProfileName,
  teamProfileDescription,
}) {
  await axios({
    method: 'POST',
    url: '/api/v1/team',
    data: {
      teamProfileName,
      teamProfileDescription,
    },
  });
}

export default function CreateTeam() {
  const history = ReactRouter.useHistory();
  const accept = (input) => {
    createTeam({
      teamProfileName: input.name,
      teamProfileDescription: input.description,
    }).then(() => {
      history.go(0);
    });
  };
  return (
    <>
      <TeamEditPreset title="새 팀 생성" onSubmit={accept} />
    </>
  );
}
