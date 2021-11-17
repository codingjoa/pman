import React from 'react'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'

import FileUpload from './FileUpload'

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import * as Icon from 'react-bootstrap-icons'

async function download(teamID, scheduleID, fileName) {
  const res = await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/file`,
    method: 'GET',
    responseType: 'blob'
  });
  const blob = res.data;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

function FileDownload({
  fileName,
}) {
  const params = ReactRouter.useParams();
  const handleClick = event => {
    event.preventDefault();
    download(params.teamID, params.scheduleID, fileName);
  }
  return <a onClick={handleClick} target="_blank" rel="noreferrer" href={`/action/file/schedule/${params.teamID}/${params.scheduleID}/${fileName}`}>{fileName}</a>;
}

async function deleteFile(teamID, scheduleID) {
  const res = await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/file`,
    method: 'DELETE'
  });
}

function FileDelete() {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const handleClick = event => {
    event.preventDefault();
    const ok = window.confirm('첨부파일을 삭제합니다. (복구할 수 없습니다.)');
    ok && deleteFile(params.teamID, params.scheduleID)
    .then(() => history.go(0))
    .catch(() => alert('오류가 발생했습니다.'));
  }
  return <Icon.Trash onClick={handleClick} size={32} />
}

function File({
  fileName,
  owner,
}) {
  return (
    <Row>
      <Col xs="2">
        <h6>첨부 파일</h6>
      </Col>
      <Col>
        <h6>
          {fileName ? <FileDownload fileName={fileName} /> : '없음'}
        </h6>
        {!fileName && owner===1 && <FileUpload />}
        {fileName && owner===1 && <FileDelete />}
      </Col>
    </Row>
  );
}
export default React.memo(File);
