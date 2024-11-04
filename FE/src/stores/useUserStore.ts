import { create } from "zustand";

interface UserState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
}

// Zustand 상태 생성
const useUserStore = create<UserState>((set) => ({
  // 로컬 스토리지에서 accessToken을 초기값으로 설정
  accessToken: localStorage.getItem("accessToken"),
  setAccessToken: (token: string) => {
    // 상태에 저장
    set({ accessToken: token });
    // 로컬 스토리지에 저장
    localStorage.setItem("accessToken", token);
  },
}));

export default useUserStore;
