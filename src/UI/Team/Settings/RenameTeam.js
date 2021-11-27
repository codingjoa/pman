import axios from 'axios'
import * as ReactRouter from 'react-router-dom'
import React from 'react'

import { useFetched } from 'Hook/useFetching'
import { TeamEditPreset } from 'Common/Preset'

async function editTeam({
  teamID,
  teamProfileName,
  teamProfileDescription,
}) {
  await axios({
    method: 'PUT',
    url: `/api/v1/team/${teamID}`,
    validateStatus: status => status === 200,
    data: {
      teamProfileName,
      teamProfileDescription,
    },
  });
}

export default function RenameTeam() {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const fetchedData = useFetched();
  const accept = (input) => {
    editTeam({
      teamID: params.teamID,
      teamProfileName: input.name,
      teamProfileDescription: input.description,
    }).then(() => {
      history.go(0);
    });
  };
  return (
    <>
      <TeamEditPreset title="이름 수정" onSubmit={accept} defaultValues={{ name: fetchedData?.teamProfileName, description: fetchedData?.teamProfileDescription, }} />
    </>
  );
}
