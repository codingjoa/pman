import React from 'react'
import * as ReactRouter from 'react-router-dom'

import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'

import { useFetching } from 'Hook/useFetching'
import fetchTeams from 'Async/fetchTeams'

function TeamListDom(row) {
  const badge = row.isOwn ? <Badge bg="secondary">팀장</Badge> : null;
  return (
    <Row className="mb-2">
      <Card>
        <Card.Body>
          <Card.Title>{row.teamProfileName}{badge}</Card.Title>
          <Card.Link as={ReactRouter.Link} to={`/ui/team/${row.teamID}`}>들어가기</Card.Link>
        </Card.Body>
      </Card>
    </Row>
  );
}

function TeamList({
  fetchedData
}) {
  return fetchedData?.length ? fetchedData.map(TeamListDom) : null;
}

export default function Teams() {
  const page = useFetching(TeamList, fetchTeams);
  return <>{page}</>;
}
