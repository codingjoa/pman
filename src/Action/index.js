import React from 'react';
import * as ReactRouter from 'react-router-dom'

function Action() {
  return (
    <ReactRouter.Switch>
      <ReactRouter.Route exact path="/action/file/schedule/:teamID/:scheduleID/:fileName">

      </ReactRouter.Route>
    </ReactRouter.Switch>
  );
}

export default React.memo(Action);
