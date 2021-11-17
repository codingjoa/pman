import React from 'react'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'

import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import UserFigure from 'Common/UserFigure'

import * as TimeStamp from 'Common/TimeStamp'

async function deleteComment(teamID, scheduleID, commentID) {
  await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/comment/${commentID}`,
    method: 'DELETE',
    validateStatus(status) {
      return status === 200;
    }
  });
}

async function editComment(teamID, scheduleID, commentID, commentContent) {
  await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/comment/${commentID}`,
    method: 'PUT',
    validateStatus(status) {
      return status === 200;
    },
    data: {
      commentContent
    }
  });
}

function DeleteButton({
  commentID
}) {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const handleClick = event => {
    event.preventDefault();
    deleteComment(params.teamID, params.scheduleID, commentID)
    .then(() => history.go(0))
    .catch(() => alert('오류가 발생했습니다.'));
  }
  return <Button variant="secondary" onClick={handleClick}>삭제</Button>;
}
function EditButton({
  commentID, content
}) {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();

  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const ref = React.useRef(null);
  const handleSubmit = event => {
    event.preventDefault();
    if(!ref.current.value) {
      alert('빈 칸 없이 입력하십시오.');
      return;
    }
    const commentContent = ref.current.value;
    editComment(params.teamID, params.scheduleID, commentID, commentContent)
    .then(() => history.go(0))
    .catch(() => alert('오류가 발생했습니다.'));
  };

  const handleClick = event => {
    event.preventDefault();
  }
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
            <Row>
              <Col>
                <Form.Control as="textarea" defaultValue={content} ref={ref} rows={3} />
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

function Comment(
  row,
  index
) {
  return (
    <div key={index} className="mb-4">
      <Row>
        <Col>
          <Row>
            <Col>
              <UserFigure userName={row.commentUserName} src={row.commentUserImg} me={row.isOwned===1} />
            </Col>
            <Col xs="auto">
              {row.isOwned===1 && <><EditButton commentID={row.commentID} content={row.commentContent} /><DeleteButton commentID={row.commentID} /></>}
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="timestamp">
                <TimeStamp.RelativeDay>{row.commentCreatedAt}</TimeStamp.RelativeDay>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              {row.commentContent}
            </Col>
          </Row>
        </Col>
      </Row>
      <div className="line"></div>
    </div>
  );
}
export default Comment;
