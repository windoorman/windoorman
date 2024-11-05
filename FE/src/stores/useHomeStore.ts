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
  fetchHomes: () => Promise<void>;
  RegistHome: (home: Home) => Promise<void>;
}

const useHomeStore = create<HomeState>((set) => ({
  homes: [],

  // 데이터 가져오는 함수
  fetchHomes: async () => {
    try {
      const response = await axiosApi.get<Home[]>("/places");
      set({ homes: response.data });
      console.log("Fetched homes:", response.data);
    } catch (error) {
      console.error("Failed to fetch homes: ", error);
    }
  },
  RegistHome: async (home: Home) => {
    try {
      const response = await axiosApi.post<Home>("/places", home);
      set((state) => ({ homes: [...state.homes, response.data] }));
      console.log("Registed home:", response.data);
    } catch (error) {
      console.error("Failed to regist home:", error);
    }
  },
}));

export default useHomeStore;
