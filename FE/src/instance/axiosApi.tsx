import axios from "axios";
import useUserStore from "../stores/useUserStore"; // Zustand 경로에 맞게 수정

const axiosApiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 설정
axiosApiInstance.interceptors.request.use(
  (config) => {
    const accessToken = useUserStore.getState().accessToken; // Zustand에서 accessToken 가져오기
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`; // 헤더에 토큰 추가
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosApiInstance;
