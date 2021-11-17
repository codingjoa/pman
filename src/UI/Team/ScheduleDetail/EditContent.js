import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'

import { getDate } from 'Common/TimeStampAPI'

async function editContent(option, body, callback) {
  await axios.patch(`/api/v1/team/${option.teamID}/schedule/${option.scheduleID}`, body);
}

function EditContent({
  content, title, publishDate, expiryDate
}) {
  const [show, setShow] = React.useState(false);
  const handleClose = () => {
    if(ref.current.value !== content || refTitle.current.value !== title) {
      const forced = window.confirm('수정되지 않은 내용이 있습니다. 취소할까요?');
      if(!forced) {
        return;
      }
    }
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const ref = React.useRef(null);
  const refTitle = React.useRef(null);
  const refPublishDate = React.useRef(null);
  const refExpiryDate = React.useRef(null);
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const option = {
    teamID: params.teamID,
    scheduleID: params.scheduleID
  };
  const handleSubmit = event => {
    event.preventDefault();
    if(!ref.current.value || !refTitle.current.value) {
      alert('빈 칸 없이 입력하십시오.');
      return;
    }
    const body = {};
    if(ref.current.value !== content) {
      body.scheduleContent = ref.current.value;
    }
    if(refTitle.current.value !== title) {
      body.scheduleName = refTitle.current.value;
    }
    if(refPublishDate.current.value !== publishDate) {
      body.schedulePublishAt = refPublishDate.current.value;
    }
    if(refExpiryDate.current.value !== expiryDate) {
      body.scheduleExpiryAt = refExpiryDate.current.value;
    }
    editContent(option, body)
    .then(() => history.go(0))
    .catch(() => alert('실패했습니다.'));
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        수정
      </Button>
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>내용 수정하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-2">
              <Col>
                <Form.Control defaultValue={title} ref={refTitle} />
              </Col>
            </Row>
            <Row className="mb-2 align-items-center">
              <Col>
                <Form.Control required type="date" defaultValue={getDate(publishDate)} ref={refPublishDate} />
              </Col>
              <Col xs="auto">
                부터
              </Col>
              <Col>
                <Form.Control type="date" defaultValue={getDate(expiryDate)} ref={refExpiryDate} />
              </Col>
              <Col xs="auto">
                까지
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Control as="textarea" defaultValue={content} ref={ref} rows={15} />
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

export default EditContent;
