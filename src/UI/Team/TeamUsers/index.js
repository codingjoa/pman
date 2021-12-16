import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'
import { useFetched } from 'Hook/useFetching'
import UserFigure from 'Common/UserFigure'
import { Time } from 'Common/TimeStamp'
import Button from 'react-bootstrap/Button'

async function kick({
  teamID,
  userID,
}) {
  await axios({
    method: 'DELETE',
    url: `/api/v1/team/${teamID}/user/${userID}`,
  });
}

function Kick({
  userID,
  userName,
  disabled
}) {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const handleClick = () => {
    const ok = window.confirm(`${userName} 사용자를 팀에서 강퇴합니다. (다시 초대할 수 있습니다.)`);
    if(ok) {
      kick({
        teamID: params.teamID,
        userID,
      }).then(() => {
        history.go(0);
      });
    }
  };
  return (
    <>
      <Button disabled={disabled} onClick={handleClick}>삭제</Button>
    </>
  );
}

function User(row, index) {
  const fetchedData = useFetched();
  return (
    <tr key={index}>
      <td>{row.userID}</td>
      <td>
        <UserFigure userName={row.userProfileName} src={row.userProfileImg} owner={!!row.isOwner} />
      </td>
      <td>
        <Time>
          {row.teamJoinedAt}
        </Time>
      </td>
      <td>
        {fetchedData.owned===1 && <Kick disabled={!!row.isOwner} userID={row.userID} userName={row.userProfileName} />}
      </td>
    </tr>
  );
}

export default function TeamUsers() {
  const fetchedData = useFetched();
  const list = React.useMemo(() => {
    return fetchedData?.users && fetchedData.users.map(User);
  }, [
    fetchedData
  ]);
  return (
    <>
      <div className="line"></div>
      <table className="width-full">
        <thead>
          <tr>
            <th>번호</th>
            <th>이름</th>
            <th>참가일</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {list}
        </tbody>
      </table>
    </>
  );
}
