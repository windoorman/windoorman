import { create } from "zustand";
import useHomeStore from "./useHomeStore"; // 홈 상태 스토어 가져오기

interface UserState {
  accessToken: string | null;
  userName: string | null;
  setAccessToken: (token: string) => void;
  setUserName: (name: string) => void;
}

// Zustand 상태 생성
const useUserStore = create<UserState>((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  userName: null,

  setAccessToken: (token: string) => {
    // 로그인 시 홈 상태 초기화
    useHomeStore.getState().resetHomes();

    // accessToken 설정 및 로컬 스토리지에 저장
    set({ accessToken: token });
    localStorage.setItem("accessToken", token);
  },
  setUserName: (name: string) => set({ userName: name }),
}));

export default useUserStore;
