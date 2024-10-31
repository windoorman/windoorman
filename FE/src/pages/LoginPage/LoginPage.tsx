import loginButton from "../../assets/login/kakao_login_medium_narrow.png";

const LoginPage = () => {
  const K_REST_API_KEY = import.meta.env.VITE_K_REST_API_KEY;
  const K_REDIRECT_URI = "http://localhost:5173/login/kakao";
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${K_REST_API_KEY}&redirect_uri=${K_REDIRECT_URI}&response_type=code`;

  const handleKakaoLogin = () => {
    window.location.href = kakaoURL;
  };
  return (
    <div>
      <div className="font-bold text-[#3752A6] mt-60">
        <h1>WINDOOR</h1>
        <h1>MAN</h1>
      </div>
      <div className="mt-16">
        <button onClick={handleKakaoLogin}>
          <img src={loginButton} alt="카카오 로그인" />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
