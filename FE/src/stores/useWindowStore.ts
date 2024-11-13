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
  buttonState: {
    [id: number]: { disabled: boolean; remainingTime: number | null };
  };
  fetchWindows: (homeId: number) => Promise<void>;
  fetchDevices: () => Promise<DeviceItem[]>;
  RegistDevice: (
    device: DeviceItem,
    homeId: number,
    homeName: string
  ) => Promise<void>;
  toggleWindowState: (
    windowId: number,
    newState: "open" | "close"
  ) => Promise<void>;
  startTimer: (windowId: number) => void;
  detailWindow: (windowId: number) => void;
  autoWindow: (windowId: number, isAuto: boolean) => void;
}

const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  devices: [],
  buttonState: {},

  fetchWindows: async (homeId: number) => {
    try {
      const response = await axiosApi.get<{ windows: WindowItem[] }>(
        `/windows/${homeId}`
      );
      set({ windows: response.data.windows });
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
      return [];
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

  toggleWindowState: async (windowId: number, newState: "open" | "close") => {
    try {
      await axiosApi.get(`/windows/${newState}/${windowId}`);
      set((state) => ({
        windows: state.windows.map((window) =>
          window.windowsId === windowId
            ? { ...window, state: newState }
            : window
        ),
      }));
    } catch (error) {
      console.error("Failed to toggle window state:", error);
    }
  },

  startTimer: (windowId: number) => {
    set((state) => ({
      buttonState: {
        ...state.buttonState,
        [windowId]: { disabled: true, remainingTime: 30 },
      },
    }));

    const intervalId = setInterval(() => {
      set((state) => {
        const remainingTime =
          (state.buttonState[windowId].remainingTime || 1) - 1;
        if (remainingTime <= 0) {
          clearInterval(intervalId);
          return {
            buttonState: {
              ...state.buttonState,
              [windowId]: { disabled: false, remainingTime: null },
            },
          };
        }
        return {
          buttonState: {
            ...state.buttonState,
            [windowId]: { disabled: true, remainingTime },
          },
        };
      });
    }, 1000);
  },
  detailWindow: async (windowsId: number) => {
    try {
      await axiosApi.get(`/windows/detail/${windowsId}`);
    } catch (error) {
      console.error("Failed to fetch detail window: ", error);
    }
  },
  autoWindow: async (windowsId: number, isAuto: boolean) => {
    try {
      await axiosApi.patch(`/windows/toggle`, { windowsId, isAuto });
    } catch (error) {
      console.error("Failed to fetch auto window: ", error);
    }
  },
}));

export default useWindowStore;
