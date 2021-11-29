import React from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import axios from 'axios'

async function download({
  fileName,
  fileUrl,
}) {
  const res = await axios({
    url: fileUrl,
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

export function FileDownload({
  fileName,
  fileUrl,
}) {
  const handleClick = event => {
    event.preventDefault();
    download({
      fileName,
      fileUrl,
    });
  }
  return <a onClick={handleClick} target="_blank" rel="noreferrer" href="#">{fileName}</a>;
}

export function ModalPreset({
  children,
  onButtonClick,
  forceClose,
  title,
}) {
  const [show, setShow] = React.useState(false);
  const handleClose = () => {
    if(forceClose) {
      const forced = window.confirm('수정되지 않은 내용이 있습니다. 취소할까요?');
      if(!forced) {
        return;
      }
    }
    setShow(false);
  };
  const handleShow = () => setShow(true);
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        {title}
      </Button>
      <Modal show={show} onHide={handleClose} fullscreen="sm-down" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {children}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onButtonClick}>
            적용
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function TeamEditPreset({
  title,
  onSubmit,
  defaultValues,
}) {
  const name = React.useRef();
  const description = React.useRef();
  const handleSubmit = () => {
    onSubmit({
      name: name.current.value,
      description: description.current.value,
    });
  }
  return (
    <>
      <ModalPreset title={title} onButtonClick={handleSubmit} >
        <Form onSubmit={handleSubmit}>
          <Row className="mb-2">
            <Col>
              <h5>팀 이름</h5>
              <Form.Control defaultValue={defaultValues?.name} ref={name} />
            </Col>
          </Row>
          <Row>
            <Col>
              <h5>팀 설명</h5>
              <Form.Control defaultValue={defaultValues?.description} ref={description} />
            </Col>
          </Row>
        </Form>
      </ModalPreset>
    </>
  );
}
