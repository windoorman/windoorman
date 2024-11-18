import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SyncLoader from "react-spinners/SyncLoader";
import loginButton from "../../assets/login/kakao_login_medium_narrow.png";
import Logo from "../../assets/window/windoormanLogo.png";
import useScheduleStore from "../../stores/useScheduleStore";
import useUserStore from "../../stores/useUserStore";

const LoginPage = () => {
  const url = import.meta.env.VITE_API_URL;
  const { fetchSchedules } = useScheduleStore();
  const navigate = useNavigate();
  const [stage, setStage] = useState(0); // 0: 로고 표시, 1: 로딩 스피너, 2: 로그인 버튼 또는 리디렉션

  const handleKakaoLogin = () => {
    window.location.href = `${url}/oauth2/authorization/kakao`;
  };

  useEffect(() => {
    // 로고가 2초 동안 나타난 후
    const logoTimer = setTimeout(() => {
      setStage(1); // 로딩 스피너 단계로 이동

      // 로딩 스피너가 2초 동안 표시되는 동안 fetchSchedules 실행
      const spinnerTimer = new Promise((resolve) => setTimeout(resolve, 2000));

      Promise.all([fetchSchedules(), spinnerTimer])
        .then(() => {
          const updatedAccessToken = useUserStore.getState().accessToken;
          if (updatedAccessToken) {
            navigate("/window");
          } else {
            setStage(2); // 로그인 버튼 표시 단계로 이동
          }
        })
        .catch(() => {
          setStage(2); // 로그인 버튼 표시 단계로 이동
        });
    }, 2000); // 로고 표시 시간

    return () => clearTimeout(logoTimer);
  }, [fetchSchedules, navigate]);

  return (
    <div>
      <div className="font-bold text-[#3752A6] mt-60">
        <img
          className="w-48 h-48 flex items-center justify-center mx-auto animate-fade-in"
          src={Logo}
          alt="윈도우맨"
        />
      </div>
      <div className="mt-16 flex items-center justify-center">
        {stage === 0 && null /* 로고가 표시되는 동안 아무것도 표시하지 않음 */}
        {stage === 1 && <SyncLoader color="#3752A6" /> /* 로딩 스피너 표시 */}
        {stage === 2 && (
          <button onClick={handleKakaoLogin} className="shadow-none">
            <img src={loginButton} alt="카카오 로그인" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
