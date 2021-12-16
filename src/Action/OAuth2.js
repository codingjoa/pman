import axios from 'axios'
import React from 'react'
import * as ReactRouter from 'react-router-dom'
import { authorization } from '@/ajax'
import { useViewDispatch } from '@/hook'

function useQuery() {
  return new URLSearchParams(ReactRouter.useLocation().search);
}

function Refresh() {
  const history = ReactRouter.useHistory();
  history.go('/');
  return <></>;
}

export default function OAuth2() {
  const query = useQuery();
  const code = query.get('code');
  const view = useViewDispatch({
    effect(state, dispatch) {
      if(state.type === 'pending') {
        authorization({ code: state.code }).then(
          dispatch({ type: 'LOGIN' }),
          dispatch({ type: 'NOT_LOGIN' })
        );
      }
    },
    view(state, dispatch) {
      if(state.type === 'NOT_LOGIN') {
        return <>로그인 실패.</>
      }
      if(state.type === 'LOGIN') {
        return <Refresh />
      }
      return null;
    },
    reducer(state, action) {
      return {
        ...state,
        ...action,
      };
    },
    initialValue: {
      type: 'pending',
      code,
    }
  });
  return view;
}
