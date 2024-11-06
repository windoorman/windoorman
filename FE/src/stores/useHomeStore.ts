import { create } from "zustand";
import axiosApi from "../instance/axiosApi";

export interface Home {
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
  updateHome: (home: Home) => Promise<void>;
  deleteHome: (homeId: number) => Promise<void>;
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
      set((state) => ({ homes: [...state.homes, home] }));
      if (home.isDefault) {
        set((_state) => ({ defaultHome: home }));
      }
      console.log("Registered homeId:", response);
    } catch (error) {
      console.error("Failed to register home:", error);
    }
  },

  updateHome: async (home: Home) => {
    try {
      await axiosApi.patch<Home>(`/places`, home);
      set((state) => {
        const updatedHomes = state.homes.map((h) => {
          if (h.isDefault && h.id !== home.id) {
            return { ...h, isDefault: false };
          }
          return h;
        });

        const newHomes = updatedHomes.map((h) =>
          h.id === home.id ? { ...home, isDefault: home.isDefault } : h
        );

        return {
          homes: newHomes,
          defaultHome: home.isDefault ? home : state.defaultHome,
        };
      });

      console.log("Updated homeId:", home.id);
    } catch (error) {
      console.error("Failed to update home:", error);
    }
  },

  deleteHome: async (homeId: number) => {
    try {
      await axiosApi.delete(`/places/${homeId}`);
      set((state) => ({
        homes: state.homes.filter((home) => home.id !== homeId),
      }));
      set((state) => {
        const defaultHome = state.homes.find((home) => home.isDefault) || null;
        return { defaultHome };
      });
      console.log("Deleted homeId:", homeId);
    } catch (error) {
      console.error("Failed to delete home:", error);
    }
  },
}));

export default useHomeStore;
