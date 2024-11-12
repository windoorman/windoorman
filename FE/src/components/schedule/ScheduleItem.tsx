import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useScheduleStore from "../../stores/useScheduleStore"; // zustand store import

type ScheduleItemProps = {
  location: string;
  room: string;
  startTime: string;
  endTime: string;
  days: string[];
  initialEnabled: boolean;
  groupId: number;
  windowsId: number;
};

// 시간 형식 변환 함수 (오전/오후 구분)
const formatTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "오전" : "오후";
  const formattedHour = hour % 12 || 12; // 0을 12로 변경
  const formattedMinute = String(minute).padStart(2, "0"); // 분을 두 자리로 포맷
  return `${period} ${String(formattedHour).padStart(
    2,
    "0"
  )}:${formattedMinute}`;
};

const ScheduleItem = ({
  location,
  room,
  startTime,
  endTime,
  days,
  initialEnabled,
  groupId,
  windowsId,
}: ScheduleItemProps) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const isActive = useScheduleStore((state) => state.isActive);
  const deleteSchedule = useScheduleStore((state) => state.deleteSchedule);
  const navigate = useNavigate();

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
    setShowActions((prev) => !prev);
  };

  const handleEdit = () => {
    navigate(`/schedule/update`, {
      state: {
        groupId,
        windowsId,
        startTime,
        endTime,
        days,
      },
    });
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule(groupId);
      setModalMessage("일정이 성공적으로 삭제되었습니다.");
      setShowDeleteModal(false);
      setShowCompleteModal(true);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      setModalMessage("일정 삭제에 실패했습니다. 다시 시도해 주세요.");
      setShowCompleteModal(true);
    }
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
            <div className="font-medium">{room}</div>
          </div>
          <div className="flex items-center">
            <div className="font-bold text-lg">{formatTime(startTime)}</div>
          </div>
          <div className="flex text-[#B0B0B0]">{days.join(" ")}</div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
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
            onClick={() => setShowDeleteModal(true)}
            className="text-[#E65B5B] border border-[#E65B5B] rounded px-2 py-1 text-xs font-semibold shadow-none"
          >
            삭제
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-[#3C4973] mb-4">
              정말 삭제하시겠습니까?
            </p>
            <button
              onClick={handleDelete}
              className="bg-[#E65B5B] text-white px-4 py-2 rounded-lg font-semibold mr-4"
            >
              확인
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="bg-gray-300 text-[#3C4973] px-4 py-2 rounded-lg font-semibold"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 삭제 완료 모달 */}
      {showCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-[#3C4973] mb-4">
              {modalMessage}
            </p>
            <button
              onClick={() => setShowCompleteModal(false)}
              className="bg-[#3752A6] text-white px-4 py-2 rounded-lg font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleItem;
