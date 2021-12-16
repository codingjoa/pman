import Container from 'react-bootstrap/Container'

const apiKey = process.env.REACT_APP_KAKAO_APIKEY;
const callbackURI = process.env.REACT_APP_KAKAO_CALLBACKURI;

export default function Login() {
  return (
    <Container>
      <h2>대충 사이트 제목</h2>
      <p>우리 사이트 쓰면 협업하기 좋음</p>
      <a href={`https://kauth.kakao.com/oauth/authorize?client_id=${apiKey}&redirect_uri=${callbackURI}&response_type=code`}>
        카카오 로그인
      </a>
    </Container>
  );
}
