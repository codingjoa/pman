import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'
import { ModalPreset, FileDownload } from 'Common/Preset'
import * as TimeStamp from 'Common/TimeStamp'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

async function addStatus({
  teamID,
  scheduleID,
  file,
  content = '',
}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('statusContent', content);
  await axios({
    method: 'POST',
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/status`,
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  });
}

function AddStatus({
  teamID,
  scheduleID,
}) {
  const history = ReactRouter.useHistory();
  const file = React.useRef(null);
  const content = React.useRef(null);
  const handleSubmit = () => {
    addStatus({
      teamID,
      scheduleID,
      file: file.current.files[0],
      content: content.current.value,
    }).then(() => history.go(0), () => alert('실패했습니다.'));
  }
  return <ModalPreset title="제출" onButtonClick={handleSubmit}>
    <Form onSubmit={handleSubmit}>
      <Row className="mb-2">
        <Col>
          <Form.Control type="file" ref={file} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Control as="textarea" ref={content} rows={15} />
        </Col>
      </Row>
    </Form>
  </ModalPreset>
}





async function dropStatus({
  teamID,
  scheduleID,
}) {
  await axios({
    method: 'DELETE',
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/status`,
  });
}
function Detail({
  teamID,
  scheduleID,
  fetchedData,
}) {
  const history = ReactRouter.useHistory();
  const handleClick = () => {
    dropStatus({
      teamID,
      scheduleID,
    }).then(() => history.go(0), () => alert('실패했습니다.'));
  };
  return <>
    <Row className="mb-2">
      <Col xs="2">
        <h6>작업 내용</h6>
      </Col>
      <Col>
        {fetchedData.statusContent}
      </Col>
    </Row>
    <Row className="mb-2">
      <Col xs="2">
        <h6>제출 일자</h6>
      </Col>
      <Col>
        <TimeStamp.Time>{fetchedData.createdAt}</TimeStamp.Time>
      </Col>
    </Row>
    <Row className="mb-2">
      <Col xs="2">
        <h6>첨부 파일</h6>
      </Col>
      <Col>
        <FileDownload fileName={fetchedData.fileName} fileUrl={`/api/v1/team/${teamID}/schedule/${scheduleID}/status/file`} />
      </Col>
    </Row>
    <div></div>
    <div><Button onClick={handleClick}>제출 취소</Button></div>
  </>
}



async function myStatus({
  teamID,
  scheduleID,
}) {
  const result = await axios({
    method: 'GET',
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/status`,
  }).then(res => res.data, err => {
    if(err.response.status === 404) {
      return 404;
    }
    throw err;
  });
  return result;
}
export default function ScheduleStatus() {
  const params = ReactRouter.useParams();
  const [ fetchedData, setFetchedData ] = React.useState(null);
  React.useLayoutEffect(() => {
    myStatus({
      teamID: params.teamID,
      scheduleID: params.scheduleID,
    }).then(setFetchedData, () => 0);
  }, []);
  const view = React.useMemo(() => {
    if(!fetchedData) {
      return null;
    }
    if(fetchedData === 404) {
      return <AddStatus teamID={params.teamID} scheduleID={params.scheduleID} />;
    }
    return <Detail fetchedData={fetchedData} teamID={params.teamID} scheduleID={params.scheduleID} />;
  }, [ fetchedData, params ]);
  return (
    <>
      <div className="line"></div>
      <h3>제출</h3>
      {view}
    </>
  );
}
