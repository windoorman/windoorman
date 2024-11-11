import { create } from "zustand";
import axiosApi from "../instance/axiosApi";

export interface WindowItem {
  windowsId: number;
  name: string;
  state: string;
  auto: boolean;
}

export interface DeviceItem {
  isRegistered: boolean;
  label: string;
  deviceId: string;
}

interface WindowState {
  windows: WindowItem[];
  devices: DeviceItem[];
  fetchWindows: (homeId: number) => Promise<void>;
  fetchDevices: () => Promise<DeviceItem[]>;
  RegistDevice: (
    device: DeviceItem,
    homeId: number,
    homeName: string
  ) => Promise<void>;
}

const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  devices: [],

  fetchWindows: async (homeId: number) => {
    try {
      const response = await axiosApi.get<{ windows: WindowItem[] }>(
        `/windows/${homeId}`
      );
      set({ windows: response.data.windows });
      console.log("Fetched windows: ", response.data);
    } catch (error) {
      console.error("Failed to fetch windows: ", error);
    }
  },

  fetchDevices: async () => {
    try {
      const response = await axiosApi.get<DeviceItem[]>("/devices");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch devices: ", error);
      return []; // 오류 발생 시 빈 배열 반환
    }
  },
  RegistDevice: async (device: DeviceItem, homeId: number) => {
    try {
      const body = {
        placeId: homeId,
        name: device.label,
        deviceId: device.deviceId,
      };
      await axiosApi.post<DeviceItem>("/windows", body);
      set((state) => ({ devices: [...state.devices, device] }));
    } catch (error) {
      console.error("Failed to register device: ", error);
    }
  },
}));

export default useWindowStore;
