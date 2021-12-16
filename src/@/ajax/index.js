import axios from 'axios'

export async function getAuthorized() {
  const res = await axios({
    method: 'GET',
    url: '/api/v1/oauth/refresh',
    validateStatus(status) {
      return status === 200;
    },
  });
  const accessToken = res.data?.accessToken;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

export async function authorization({
  code,
}) {
  const res = await axios({
    method: 'GET',
    url: `/api/v1/oauth/kakao?code=${code}`,
  });
  const accessToken = res.data?.accessToken;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

export async function fetchMe() {
  const r = await axios('/api/v1/user/me');
  return r.data;
}
