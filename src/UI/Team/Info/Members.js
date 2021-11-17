import React from 'react'
import * as ReactRouter from 'react-router-dom'

import { useFetched } from 'Hook/useFetching'
import fetchTeamMembers from 'Async/fetchTeamMembers'
import * as Badges from 'Common/Badges'

import Col from 'react-bootstrap/Col'
import Figure from 'react-bootstrap/Figure'
import Row from 'react-bootstrap/Row'

import UserFigure from 'Common/UserFigure'

const OwnerFigure = React.memo(function OwnerFigure({
  owner: row
}) {
  return (
    <Figure>
      <Figure.Image
        className="rounded-circle"
        width={32}
        height={32}
        src={row.userProfileImg}
      />
      {row.userProfileName}
      <Badges.OwnerTag owner />
    </Figure>
  );
});

function MemberFigure(
  row,
  index
) {
  return (
    <Figure key={index}>
      <Figure.Image
        className="rounded-circle"
        width={32}
        height={32}
        src={row.userProfileImg}
      />
      {row.userProfileName}
    </Figure>
  );
}

function MembersComponent() {
  const members = useFetched();
  const owner = members.users.filter(row => row.isOwner === 1)[0];
  return (
    <>
      <div className="line mt-5"></div>
      <h1>팀원 목록</h1>
      <Row className="mb-5">
        <UserFigure userName={owner.userProfileName} src={owner.userProfileImg} owner />
        {members.users.filter(row => row.isOwner !== 1).map(row =>
          <UserFigure userName={row.userProfileName} src={row.userProfileImg} />
        )}
      </Row>
    </>
  );
}

export default React.memo(MembersComponent)
/*
export default function Members() {
  const params = ReactRouter.useParams();
  const teamID = params.teamID;
  const view = useFetching(MembersComponent, fetchTeamMembers, teamID);
  return <>{view}</>;
}
*/
