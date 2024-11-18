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
export interface SensorRecord {
  timestamp: string;
  value: number;
}

export interface AirAnalysisResponse {
  airReport: {
    reportId: number;
    lowTemperature: number;
    highTemperature: number;
    humidity: number;
    airCondition: number;
  };
  windows: Array<{
    windowsId: number;
    name: string;
  }>;
  actionsReport: any[]; // 필요에 따라 타입 정의
}

export interface WindowStates {
  actionReportId: number;
  open: string;
  openTime: string;
}

export interface WindowSearchResponse {
  windows: { windowsId: number; name: string; state: string; auto: boolean }[];
  placeName: string;
}

interface WindowState {
  windows: WindowItem[];
  devices: DeviceItem[];
  windowStates: WindowStates[];
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
  fetchSensorRecords: (
    windowId: number,
    category: number,
    range: number
  ) => Promise<SensorRecord[]>;
  airAnalysis: (homeId: number, reportDate: string) => void;
  windowStatus: (windowId: number, reportDate: string) => void;
  windowIdSearch: (homeId: number) => Promise<WindowSearchResponse>;
  statusGraph: (actionReportId: number) => void;
}

const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  devices: [],
  buttonState: {},
  windowStates: [],

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
        [windowId]: { disabled: true, remainingTime: 20 },
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

  fetchSensorRecords: async (
    windowId: number,
    category: number,
    range: number
  ) => {
    try {
      const response = await axiosApi.get<SensorRecord[]>(
        `/sensors/records/${windowId}/${category}/${range}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch sensor records:", error);
      return [];
    }
  },

  airAnalysis: async (
    homeId: number,
    reportDate: string
  ): Promise<AirAnalysisResponse | null> => {
    try {
      const response = await axiosApi.get<AirAnalysisResponse>(
        `/reports/${homeId}/${reportDate}`
      );
      console.log(response.data);
      return response.data; // 명시적으로 반환
    } catch (error) {
      console.error("Failed to fetch air analysis: ", error);
      return null;
    }
  },
  windowStatus: async (windowId: number, reportDate: string) => {
    try {
      const response = await axiosApi.get(
        `/reports/actions/${windowId}/${reportDate}`
      );
      console.log(response.data);
      set({ windowStates: response.data });
    } catch (error) {
      console.error("Failed to fetch window status: ", error);
    }
  },
  windowIdSearch: async (homeId: number) => {
    try {
      const response = await axiosApi.get(`/windows/${homeId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch window id: ", error);
      return [];
    }
  },
  statusGraph: async (actionReportId: number) => {
    try {
      const response = await axiosApi.get(`/reports/graphs/${actionReportId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch status graph: ", error);
    }
  },
}));

export default useWindowStore;
