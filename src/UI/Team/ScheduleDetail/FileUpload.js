import React from 'react'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'
import * as Icon from 'react-bootstrap-icons'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'

async function uploadFile(teamID, scheduleID, file) {
  const formData = new FormData();
  formData.append('file', file);
  await axios({
    url: `/api/v1/team/${teamID}/schedule/${scheduleID}/file`,
    method: 'PUT',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
    responseType: 'json',
  });
}

function handlar(state, action) {
  return { ...state, ...action };
}


export default React.memo(function FileUpload() {
  const [ show, setShow ] = React.useState(false);
  const [ state, dispatch ] = React.useReducer(handlar, {
    pending: false,
    complete: null
  });
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const ref = React.useRef(null);
  const handleSubmit = () => {
    if(!ref.current.files[0]) {
      alert('파일을 첨부하세요.');
      return;
    }
    dispatch({ pending: true });
    !state.pending && uploadFile(params.teamID, params.scheduleID, ref.current.files[0])
    .then(() => history.go(0))
    .catch(() => {
      dispatch({ pending: false, complete: false });
      alert('오류가 발생했습니다.');
    });
  };
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  return (
    <>
      <Icon.FileEarmarkPlus size={32} onClick={handleShow} />
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>파일 업로드</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control type="file" ref={ref} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit} disabled={state.pending}>
            업로드
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
})
