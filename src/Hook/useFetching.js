import React from 'react'
const Context = React.createContext(null);

function reducer(state, action) {
  if(action instanceof Function) {
    return action(state);
  } else if(action instanceof Object) {
    return {
      ...state,
      ...action
    }
  } else {
    return action;
  }
}

export function useFetching(Dom, fetchFunction, Args) {
  const [ state, dispatch ] = React.useReducer(reducer, { args: Args, payload: null, pending: true });
  /*
  const fetchFunc = React.useCallback((body) => {
    fetchFunction instanceof Function && fetchFunction(body).then(setData, setData);
  }, [
    fetchFunction
  ]);
  */
  const page = React.useMemo(() => {
    if(state.payload === null) {
      return null;
    } else if(state.payload === undefined) {
      return <>불러오기 실패.</>
    } else {
      return <Context.Provider value={{ fetchedData: state.payload, dispatch, state: state.args }} ><Dom reload={dispatch} fetchedData={state.payload} /></Context.Provider>
    }
  }, [ state ]);
  React.useLayoutEffect(() => {
    if(!state.pending) return;
    fetchFunction instanceof Function && fetchFunction(state.args)
    .then(data => dispatch({
      payload: data,
      pending: false,
    }), () => dispatch({
      payload: undefined,
      pending: false,
    }));
  }, [ fetchFunction, state ]);
  //const memArgs = React.useMemo(() => args, [ ...args ]);
  //const memFn = React.useMemo(() => fetchFunction, [ fetchFunction ]);
  /*
  React.useLayoutEffect(() => {
    memFn(...memArgs).then(result => {
      setData(result);
    }, err => {

    });
  }, [ memFn, memArgs ]);
  */
  return page;
}

export function useFetched() {
  const values = React.useContext(Context);
  return values.fetchedData
}

export function useFetchReload() {
  const values = React.useContext(Context);
  const reload = Args => values.dispatch({ args: Args, pending: true });
  return [ values.state, reload ];
}
