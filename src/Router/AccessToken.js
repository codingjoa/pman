import axios from 'axios';
import React from 'react'
import PageRouter from './PageRouter'

import { getAuthorized } from '@/ajax'

const AccessTokenContext = React.createContext(null);

export default function AccessToken() {
  const [ authorized, setAuthorized ] = React.useState(null);
  React.useLayoutEffect(() => {
    getAuthorized().then(state => setAuthorized(state));
  });
  return <AccessTokenContext.Provider value={authorized} ><PageRouter authorized={authorized} /></AccessTokenContext.Provider>
}
export function useAuthorized() {
  const state = React.useContext(AccessTokenContext);
  if(state) {
    return true;
  }
  return state;
}
