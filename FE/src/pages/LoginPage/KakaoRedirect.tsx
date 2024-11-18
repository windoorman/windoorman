import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qs from "qs";
import useUserStore from "../../stores/useUserStore"; // Zustand 상태 저장소 경로에 맞게 수정

const KakaRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  useEffect(() => {
    // 현재 URL에서 access 토큰을 쿼리 파라미터로부터 추출
    const { access } = qs.parse(location.search, {
      ignoreQueryPrefix: true,
    });

    if (typeof access === "string") {
      setAccessToken(access); // Zustand에 access 토큰 저장
      console.log("access token:", useUserStore.getState().accessToken);
      navigate("/window"); // 메인 페이지로 이동
    } else {
      console.error("Access token not found in the URL");
    }
  }, [location.search, setAccessToken, navigate]);

  return <div>Loading...</div>;
};

export default KakaRedirect;
