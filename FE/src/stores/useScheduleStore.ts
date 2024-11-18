import { create } from "zustand";
import axiosApi from "../instance/axiosApi";

export interface Schedule {
  scheduleId: number;
  groupId: number;
  windowsId: number;
  placeName: string;
  windowName: string;
  startTime: string;
  endTime: string;
  days: string[];
  activate: boolean;
}

interface ScheduleState {
  schedules: Schedule[];
  RegistSchedule: (
    windowsId: number,
    startTime: string,
    endTime: string,
    days: string[]
  ) => Promise<void>;
  fetchSchedules: () => Promise<void>;
  updateSchedule: (
    groupId: number,
    windowsId: number,
    startTime: string,
    endTime: string,
    days: string[]
  ) => Promise<void>;
  deleteSchedule: (groupId: number) => Promise<void>;
  isActive: (groupId: number, activate: boolean) => Promise<void>;
}

const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  RegistSchedule: async (windowsId, startTime, endTime, days) => {
    try {
      const response = await axiosApi.post("/schedules", {
        windowsId,
        startTime,
        endTime,
        days,
      });
      console.log("Registered schedule:", response);
    } catch (error) {
      console.error("Failed to register schedule:", error);
    }
  },
  fetchSchedules: async () => {
    try {
      const response = await axiosApi.get(`/schedules`);
      set({ schedules: response.data });
      console.log("Fetched schedules:", response);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  },
  isActive: async (groupId, isActivate) => {
    try {
      await axiosApi.patch(`/schedules/toggle`, { groupId, isActivate });
    } catch (error) {
      console.error("Failed to change schedule activation:", error);
    }
  },
  updateSchedule: async (groupId, windowsId, startTime, endTime, days) => {
    try {
      await axiosApi.patch(`/schedules`, {
        groupId,
        windowsId,
        startTime,
        endTime,
        days,
      });
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  },
  deleteSchedule: async (groupId) => {
    try {
      await axiosApi.delete(`/schedules/${groupId}`);
      // 스케줄 배열에서 그룹 아이디를 이용해 삭제
      set((state) => ({
        schedules: state.schedules.filter(
          (schedule) => schedule.groupId !== groupId
        ),
      }));
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  },
}));

export default useScheduleStore;
