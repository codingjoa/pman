import React from 'react'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'

import FileUpload from './FileUpload'
import { FileDownload } from 'Common/Preset'

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import * as Icon from 'react-bootstrap-icons'

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
  const params = ReactRouter.useParams();
  const fileUrl = `/api/v1/team/${params.teamID}/schedule/${params.scheduleID}/file`;
  return (
    <Row>
      <Col xs="2">
        <h6>첨부 파일</h6>
      </Col>
      <Col>
        <h6>
          {fileName ? <FileDownload fileName={fileName} fileUrl={fileUrl} /> : '없음'}
        </h6>
        {!fileName && owner===1 && <FileUpload />}
        {fileName && owner===1 && <FileDelete />}
      </Col>
    </Row>
  );
}
export default React.memo(File);
