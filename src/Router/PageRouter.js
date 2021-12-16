import { getAuthorized } from '@/ajax'
import { useViewDispatch } from '@/hook'
import UI from 'UI'
import UnauthUI from 'UnauthUI'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'css/share.css'

export default function PageRouter() {
  const view = useViewDispatch({
    effect(state, dispatch) {
      if(state.type === 'REFRESH') {
        getAuthorized().then(
          data => dispatch({ type: 'LOGIN' }),
          err => dispatch({ type: 'NOT_LOGIN' })
        );
      }
    },
    view(state, dispatch) {
      if(state.type === 'LOGIN') {
        return <UI />;
      }
      if(state.type === 'NOT_LOGIN') {
        return <UnauthUI />;
      }
      return <>잠시만 기다려 주세요.</>;
    },
    reducer(state, action) {
      return {
        ...state,
        ...action,
      };
    },
    initialValue: {
      type: 'REFRESH'
    },
  });
  return view;
}
