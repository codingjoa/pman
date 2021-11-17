import React from 'react'
import axios from 'axios'
import * as ReactRouter from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import * as Icon from 'react-bootstrap-icons'
import UserFigure from 'Common/UserFigure'

async function ajax({
  teamID,
  scheduleID,
  addRefUsers,
  deleteRefUsers,
}) {
  await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}`,
    method: 'PATCH',
    data: {
      addRefUsers,
      deleteRefUsers,
    },
    responseType: 'json',
  });
}

function reducer(state, action) {
  if(action.type === 'add') {
    if(state.addRefUsers.has(action.userID)) {
      state.addRefUsers.delete(action.userID);
    } else {
      state.addRefUsers.add(action.userID);
    }
  } else if(action.type === 'remove') {
    if(state.delRefUsers.has(action.userID)) {
      state.delRefUsers.delete(action.userID);
    } else {
      state.delRefUsers.add(action.userID);
    }
  }
  return state;
}

export default function EditRef({
  users,
  norefUsers,
}) {
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const [ state, dispatch ] = React.useReducer(reducer, {
    addRefUsers: new Set(),
    delRefUsers: new Set(),
  });
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSubmit = () => {
    ajax({
      teamID: params.teamID,
      scheduleID: params.scheduleID,
      addRefUsers: Array.from(state.addRefUsers),
      deleteRefUsers: Array.from(state.delRefUsers),
    })
    .then(() => history.go(0))
    .catch(() => alert('오류가 발생했습니다.'));
  };
  const AddTarget = (
    row,
    index
  ) => {
    return (
      <Row key={index} className="align-items-center">
        <Col xs="auto">
          <Form.Check type="checkbox" onChange={() => dispatch({ type: 'add', userID: row.userID })} />
        </Col>
        <Col>
          <UserFigure userName={row.userProfileName} src={row.userProfileImg} />
        </Col>
      </Row>
    );
  }
  const DelTarget = (
    row,
    index
  ) => {
    return (
      <Row key={index}>
        <Col xs="auto">
          <Form.Check type="checkbox" onChange={() => dispatch({ type: 'remove', userID: row.userID })} />
        </Col>
        <Col>
          <UserFigure userName={row.userProfileName} src={row.userProfileImg} />
        </Col>
      </Row>
    );
  }
  return (
    <>
      <Icon.PlusCircle onClick={handleShow} size={32} />
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>대상 수정하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={6}>
                <h3>대상 추가</h3>
                {norefUsers.map(AddTarget)}
              </Col>
              <Col xs={6}>
                <h3>대상 취소</h3>
                {users.map(DelTarget)}
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
