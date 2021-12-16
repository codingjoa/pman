import { fetchMe } from '@/ajax'
import { useViewDispatch } from '@/hook'

export default function MyInfo() {
  const view = useViewDispatch({
    effect(state, dispatch) {
      if(state.type === 'pending') {
        fetchMe().then(
          user => dispatch({ type: 'fetched', data: user })
        );
      }
    },
    view(state, dispatch) {
      if(state.type === 'fetched') {
        return <>
          <h4>안녕하세요. {state.data.profileName}님!</h4>
          <img width="75%" src={state.data.profileImage} alt="profileImage" />
        </>;
      }
      return <>...</>
    },
    reducer(state, action) {
      if(action.type === 'fetched') {
        return {
          type: 'fetched',
          data: action.data,
        };
      }
      return state;
    },
    initialValue: {
      type: 'pending',
    }
  });
  return view;
}
