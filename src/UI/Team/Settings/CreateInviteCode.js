import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

async function createInviteCode({
  teamID
}) {
  const result = await axios({
    method: 'POST',
    url: `/api/v1/team/${teamID}/invite`,
  }).catch(console.error);
  return result.data;
}

export default function CreateInviteCode() {
  const params = ReactRouter.useParams();
  const [ tokenInfo, setTokenInfo ] = React.useState(null);
  const inviting = () => {
    createInviteCode({
      teamID: params.teamID,
    }).then(setTokenInfo);
  };
  return (
    <>
      GET_TOKEN
      생성 횟수: {tokenInfo?.inviteCount}
      토큰: {tokenInfo?.inviteURL}
      <button onClick={inviting}>test</button>
    </>
  );
}
