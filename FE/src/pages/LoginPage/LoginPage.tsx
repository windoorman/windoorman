import loginButton from "../../assets/login/kakao_login_medium_narrow.png";
// import axios from "axios";

const LoginPage = () => {
  const url = import.meta.env.VITE_API_URL;
  const handleKakaoLogin = () => {
    // 브라우저에서 카카오 인증 페이지로 직접 리디렉션
    window.location.href = `${url}/oauth2/authorization/kakao`;
  };
  return (
    <div>
      <div className="font-bold text-[#3752A6] mt-60">
        <h1>WINDOOR</h1>
        <h1>MAN</h1>
      </div>
      <div className="mt-16">
        <button onClick={handleKakaoLogin} className="shadow-none">
          <img src={loginButton} alt="카카오 로그인" />
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
