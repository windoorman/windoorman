import { create } from "zustand";
import axiosApi from "../instance/axiosApi";

interface Home {
  id?: number;
  address: string;
  detailAddress: string;
  name: string;
  isDefault: boolean;
}

interface HomeState {
  homes: Home[];
  defaultHome: Home | null;
  fetchHomes: () => Promise<void>;
  resetHomes: () => void; // 초기화 함수 추가
  RegistHome: (home: Home) => Promise<void>;
}

const useHomeStore = create<HomeState>((set) => ({
  homes: [],
  defaultHome: null,

  fetchHomes: async () => {
    try {
      const response = await axiosApi.get<Home[]>("/places");
      set({ homes: response.data });
      set((state) => {
        const defaultHome = state.homes.find((home) => home.isDefault) || null;
        return { defaultHome };
      });
    } catch (error) {
      console.error("Failed to fetch homes: ", error);
    }
  },

  resetHomes: () => set({ homes: [], defaultHome: null }), // 초기화 구현

  RegistHome: async (home: Home) => {
    try {
      const response = await axiosApi.post<Home>("/places", home);
      set((state) => ({ homes: [...state.homes, response.data] }));
      console.log("Registered home:", response.data);
    } catch (error) {
      console.error("Failed to register home:", error);
    }
  },
}));

export default useHomeStore;
