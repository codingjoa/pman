import React from 'react'

export function useViewDispatch({
  effect,
  view,
  reducer,
  initialValue,
}) {
  const [ state, dispatch ] = React.useReducer(reducer, initialValue);
  React.useLayoutEffect(() => {
    return effect(state, dispatch);
  }, [ effect, state ]);
  const page = React.useMemo(() => {
    return view(state, dispatch);
  }, [ view, state ]);
  return page;
}
