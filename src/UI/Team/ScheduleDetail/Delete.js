import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

async function deleteSchedule(option) {
  await axios.delete(`/api/v1/team/${option.teamID}/schedule/${option.scheduleID}`);
}

function Delete() {
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const location = ReactRouter.useLocation();
  const option = {
    teamID: params.teamID,
    scheduleID: params.scheduleID
  };
  const handleSubmit = event => {
    event.preventDefault();
    deleteSchedule(option)
    .then(() => history.replace(`/ui/team/${params.teamID}${location.state.previous}`))
    .catch(() => alert('실패했습니다.'));
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        삭제
      </Button>
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>일정 삭제</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          일정을 삭제합니다. (복구할 수 없습니다.)
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit} variant="primary">
            적용
          </Button>
          <Button onClick={handleClose} variant="secondary">
            취소
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Delete;
