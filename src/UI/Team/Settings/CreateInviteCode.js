import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'
import Button from 'react-bootstrap/Button'

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
    <div>
      <div className="line"></div>
      <h3>초대하기</h3>
      {tokenInfo ? <div>
        <table className="width-full">
          <thead>
            <tr>
              <th>생성 횟수</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{tokenInfo?.inviteCount}</td>
              <td><div style={{ width: '400px', overflowX: 'scroll' }}>{tokenInfo?.inviteURL}</div></td>
            </tr>
          </tbody>
        </table>
      </div> : <Button onClick={inviting}>초대코드 생성</Button>}
    </div>
  );
}
