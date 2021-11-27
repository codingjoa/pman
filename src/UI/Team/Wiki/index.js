import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'

async function wiki({
  teamID,
}) {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/team/${teamID}/wiki`,
  });
  return res.data;
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
      <div>

      </div>
    </>
  );
}
