import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'
import { useFetched } from 'Hook/useFetching'
import UserFigure from 'Common/UserFigure'
import { Time } from 'Common/TimeStamp'


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
      <button onClick={handleClick}>삭제</button>
    </>
  );
}

function User(row, index) {
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
        <Kick userID={row.userID} userName={row.userProfileName} />
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
      <table>
        <tbody>
          {list}
        </tbody>
      </table>
    </>
  );
}
