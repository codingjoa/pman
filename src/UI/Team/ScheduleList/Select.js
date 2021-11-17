import React from 'react'
import * as ReactRouter from 'react-router-dom'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import { useFetchReload } from 'Hook/useFetching'

export default function Select() {
  const history = ReactRouter.useHistory();
  const location = ReactRouter.useLocation();
  const params = ReactRouter.useParams();
  const [ state, dispatch ] = useFetchReload();
  const handleChange = event => {
    dispatch({
      teamID: params.teamID,
      date: event.target.value.replace('#', '')
    });
  };
  React.useLayoutEffect(() => {
    history.replace({
      hash: `#${state.date}`
    });
  }, [ state ]);
  React.useLayoutEffect(() => {
    // location의 hash가 url 입력란에 의해 변경되어도 dispatch가 작동함.
    const date = location.hash.replace('#', '');
    if(!date || date === state.date) {
      return;
    }
    dispatch({
      teamID: params.teamID,
      date,
    });
  }, [ location ]);

  return (<>
    <Form.Control type="date" required value={state.date} onChange={handleChange} />
  </>);
}
