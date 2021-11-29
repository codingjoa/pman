import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import { RelativeDay } from 'Common/TimeStamp'

async function wiki({
  teamID,
}) {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/team/${teamID}/wiki`,
  });
  return res.data;
}

function Row(row, index) {
  const params = ReactRouter.useParams();
  return (
    <div key={index}>
      <ReactRouter.Link to={`/ui/team/${params.teamID}/wiki/edit/${row.wikiID}`}>
        {row.wikiTitle}
      </ReactRouter.Link>
      <RelativeDay>{row.modifiedAt}</RelativeDay>
    </div>
  );
}

export default function Wiki() {
  const params = ReactRouter.useParams();
  const [ fetchedData, setFetchedData ] = React.useState(null);
  React.useLayoutEffect(() => {
    wiki({
      teamID: params.teamID,
    }).then(setFetchedData, () => setFetchedData(false));
  }, [ params ]);

  return (
    <>
      <div className="line"></div>
      <h1>위키</h1>
      <Button as={ReactRouter.Link} to={`/ui/team/${params.teamID}/wiki/edit`}>새 문서 생성</Button>
      <div>
        {fetchedData?.list && fetchedData.list.map(Row)}
      </div>
    </>
  );
}
