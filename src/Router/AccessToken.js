import axios from 'axios';
import React from 'react'
import PageRouter from './PageRouter'

const AccessTokenContext = React.createContext(null);
const DeveloperAccessToken = process.env.REACT_APP_ACCESS_TOKEN;
let currentAccessToken = null;

async function refreshToken() {
  try {
    /*
      react-script 서버로 실행했을 때 이 함수가 2번 실행되는 버그가 있습니다.
      setupProxy.js 설정 또는 내부 디버그 툴에 의한 발생으로 추정됩니다.
      모든 도메인이 해당되며 axios가 있는 함수는 모두 해당됩니다.
      react-script build후 실제 SPA 서버로 하면 해결됩니다.
    */
    const res = await axios('/api/v1/oauth/refresh');
    return res.data?.accessToken;
  } catch(err) {
    return undefined;
  }
}
function getAccessToken() {
  return currentAccessToken;
}
async function setAccessToken() {
  const token = await refreshToken();
  if(token === undefined) {
    currentAccessToken = null;
    return false;
  }
  currentAccessToken = token ?? null;
  if(currentAccessToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${currentAccessToken}`;
  }
  return true;
}
async function autoRefresh() {
  // refresh token 자동갱신(새로고침 없이 1시간 30분 경과시)
  (await setAccessToken() === true) && setTimeout(autoRefresh, 5400000);
}
async function createAccessToken() {
  if(DeveloperAccessToken) {
    return function getAccessToken() {
      axios.defaults.headers.common['Authorization'] = `Bearer ${DeveloperAccessToken}`;
      return DeveloperAccessToken;
    };
  }
  await autoRefresh();
  return getAccessToken;
}
function useAccessToken() {
  const promise = React.useContext(AccessTokenContext);
  return promise;
}
const AccessToken = React.memo(function AccessToken() {
  const accessToken = createAccessToken();
  return (
    <AccessTokenContext.Provider
      value={accessToken}
    >
      <PageRouter />
    </AccessTokenContext.Provider>
  );
});

export { useAccessToken };
export default AccessToken;
