import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import * as Icon from 'react-bootstrap-icons'

async function addSchedule(option, body) {
  await axios.post(`/api/v1/team/${option.teamID}/schedule`, body);
}

function AddSchedule() {
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const refContent = React.useRef(null);
  const refPublishDate = React.useRef(null);
  const refExpiryDate = React.useRef(null);
  const refTitle = React.useRef(null);

  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const option = {
    teamID: params.teamID
  };
  const handleSubmit = event => {
    event.preventDefault();
    if(
      !refPublishDate.current.value || !refExpiryDate.current.value ||
      !refTitle.current.value || !refContent.current.value
    ) {
      alert('모든 입력란을 채워야 합니다.');
      return;
    };
    addSchedule(option, {
      scheduleContent: refContent.current.value,
      scheduleName: refTitle.current.value,
      schedulePublishAt: refPublishDate.current.value,
      scheduleExpiryAt: refExpiryDate.current.value,
    })
    .then(() => history.go(0))
    .catch(() => alert('실패했습니다.'));
  };

  return (
    <>
      <Icon.Plus onClick={handleShow} size={32} />
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>새 일정 추가하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-2">
              <Col>
                <Form.Control required ref={refTitle} placeholder="일정 제목" />
              </Col>
            </Row>
            <Row className="mb-2 align-items-center">
              <Col>
                <Form.Control required type="date" ref={refPublishDate} />
              </Col>
              <Col xs="auto">
                부터
              </Col>
              <Col>
                <Form.Control type="date" ref={refExpiryDate} />
              </Col>
              <Col xs="auto">
                까지
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Control as="textarea" ref={refContent} rows={15} />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit}>
            적용
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddSchedule;
