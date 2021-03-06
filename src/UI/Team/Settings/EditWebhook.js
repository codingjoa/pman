import React from 'react'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'

import Alert from 'react-bootstrap/Alert'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'

import { ModalPreset } from 'Common/Preset'
import { useFetched } from 'Hook/useFetching'

async function editWebhook({
  teamID,
  webhookURL,
}) {
  const code = await axios({
    method: 'PUT',
    url: `/api/v1/team/${teamID}/webhook`,
    data: {
      webhookURL,
    },
  }).then(res => 200, err => {
    if(err.response.status === 400) {
      return 400;
    }
    throw err;
  });
  return code
}

function Alerter({
  state
}) {
  if(state === 'complete') {
    return (
      <Alert variant="success">
        적용되었습니다.
      </Alert>
    );
  } else if(state === 'failed') {
    return (
      <Alert variant="danger">
        실패했습니다.
      </Alert>
    );
  } else if(state === 'failed-parameter') {
    return (
      <Alert variant="danger">
        유효한 웹훅 URL이 아닙니다.
      </Alert>
    );
  }
  return null;
}

export default function EditWebhook() {
  const url = React.useRef();
  const params = ReactRouter.useParams();
  const history = ReactRouter.useHistory();
  const fetchedData = useFetched();
  const [ state, setState ] = React.useState(null);
  const handleSubmit = () => {
    editWebhook({
      teamID: params.teamID,
      webhookURL: url.current.value,
    }).then(code => {
      if(code === 200) {
        history.go(0);
      } else if(code === 400) {
        setState('failed-parameter')
      }
    }, () => setState('failed'));
  }
  return (
    <>
      <ModalPreset title="웹훅 설정" onButtonClick={handleSubmit} >
        <Form onSubmit={handleSubmit}>
          <Row className="mb-2">
            <Col>
              <h5>웹훅 주소</h5>
              <Form.Control defaultValue={fetchedData?.webhookURL} ref={url} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Alerter state={state} />
            </Col>
          </Row>
        </Form>
      </ModalPreset>
    </>
  );
}
