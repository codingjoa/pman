import axios from 'axios'

let latestStatus = 401;
// refresh token 자동갱신(새로고침 없이 1시간 30분 경과시)
setInterval(getAuthorized, 5400000);

function changeAccessToken(accessToken) {
  if(accessToken === null) {
    return;
  }
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

export async function getAuthorized() {
  if(latestStatus !== 401) {
    return true;
  }
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/oauth/refresh',
      validateStatus(status) {
        return status === 200;
      },
    });
    latestStatus = 200;
    changeAccessToken(res.data?.accessToken ?? null);
    return true;
  } catch(err) {
    latestStatus = 401;
    return false;
  }
}

export async function authorization({
  code,
}) {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/oauth/kakao?code=${code}`,
  });
  latestStatus = res.status;
  changeAccessToken(res.data?.accessToken ?? null);
}
