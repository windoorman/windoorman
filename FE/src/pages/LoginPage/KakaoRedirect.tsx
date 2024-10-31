import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import qs from "qs";

const KakaRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { code } = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });

  useEffect(() => {
    if (code) {
      axios
        .post(`${import.meta.env.VITE_API_URL}/oauth/kakao?code=${code}`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data) {
            navigate("/");
          }
        });
    }
  }, [code]);

  return <div>Loading...</div>;
};

export default KakaRedirect;
