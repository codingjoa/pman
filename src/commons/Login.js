const apiKey = process.env.REACT_APP_KAKAO_APIKEY;
const callbackURI = process.env.REACT_APP_KAKAO_CALLBACKURI;
export default function Login() {
  return (
    <div>
      <h2>로그인 화면</h2>
        <a href={`https://kauth.kakao.com/oauth/authorize?client_id=${apiKey}&redirect_uri=${callbackURI}&response_type=code`}>
          카카오 로그인
        </a>
    </div>
  );
}
