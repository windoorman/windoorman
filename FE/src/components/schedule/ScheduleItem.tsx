import { useState } from "react";
import useScheduleStore from "../../stores/useScheduleStore"; // zustand store import

type ScheduleItemProps = {
  location: string;
  room: string;
  startTime: string;
  endTime: string;
  days: string[];
  initialEnabled: boolean;
  groupId: number;
};

const ScheduleItem = ({
  location,
  room,
  startTime,
  endTime,
  days,
  initialEnabled,
  groupId,
}: ScheduleItemProps) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [showActions, setShowActions] = useState(false); // 상태 추가
  const isActive = useScheduleStore((state) => state.isActive);

  const toggleSwitch = async () => {
    try {
      setIsEnabled(!isEnabled);
      await isActive(groupId, !isEnabled);
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
      setIsEnabled(isEnabled);
    }
  };

  const handleItemClick = () => {
    setShowActions((prev) => !prev); // 클릭 시 showActions 토글
  };

  const handleEdit = () => {
    console.log("Edit schedule", groupId);
  };

  const handleDelete = () => {
    console.log("Delete schedule", groupId);
  };

  return (
    <div className="flex flex-col py-2 px-4 border bg-white rounded-lg shadow-sm mb-2">
      <div
        className="flex justify-between items-center"
        onClick={handleItemClick}
      >
        <div>
          <div className="flex text-[#3C4973]">
            <div className="font-bold">{location} •&nbsp;</div>
            <div className="font-semibold">{room}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-lg">{startTime}</div>
          </div>
          <div className="flex text-[#B0B0B0]">{days.join(" ")}</div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation(); // prevent toggle action panel when toggling switch
            toggleSwitch();
          }}
          className={`relative w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
            isEnabled ? "bg-yellow-400" : ""
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
              isEnabled ? "translate-x-4" : ""
            }`}
          ></div>
        </div>
      </div>

      {/* 수정 및 삭제 버튼 */}
      {showActions && (
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={handleEdit}
            className="text-[#3752A6] border border-[#3752A6] rounded px-2 py-1 text-xs font-semibold shadow-none"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="text-[#E65B5B] border border-[#E65B5B] rounded px-2 py-1 text-xs font-semibold shadow-none"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleItem;
