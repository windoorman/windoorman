import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import useScheduleStore from "../../stores/useScheduleStore"; // zustand store import

const ScheduleRegist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { windowsId } = location.state || {};

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:45");
  const [showStartTimeSelector, setShowStartTimeSelector] = useState(false);
  const [showEndTimeSelector, setShowEndTimeSelector] = useState(false);

  const RegistSchedule = useScheduleStore((state) => state.RegistSchedule);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  // 15분 단위 시간 목록 생성 (00:00 ~ 23:45)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedTime = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        times.push(formattedTime);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // 종료 시간용 유효한 시간 목록 생성
  const getValidEndTimes = () => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    return timeOptions.filter((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour > startHour || (hour === startHour && minute > startMinute);
    });
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  const selectTime = (time: string, isStart: boolean) => {
    if (isStart) {
      if (time === "23:45") {
        alert("시작 시간은 23:45로 설정할 수 없습니다.");
        return;
      }
      setStartTime(time);
      setShowStartTimeSelector(false);

      // 시작 시간을 설정할 때, 현재 종료 시간이 시작 시간보다 빠르다면 종료 시간도 재설정
      const [startHour, startMinute] = time.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      if (
        endHour < startHour ||
        (endHour === startHour && endMinute <= startMinute)
      ) {
        setEndTime(getValidEndTimes()[0]);
      }
    } else {
      setEndTime(time);
      setShowEndTimeSelector(false);
    }
  };

  const handleRegister = async () => {
    try {
      await RegistSchedule(
        windowsId,
        `${startTime}:00`,
        `${endTime}:00`,
        selectedDays
      );
      alert("일정이 성공적으로 등록되었습니다.");
      navigate("/schedule");
    } catch (error) {
      console.error("일정 등록 실패:", error);
      alert("일정 등록에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div>
      <div className="text-[#3C4973] font-bold text-2xl ml-8 mt-8">
        <div className="flex">창문 제어 시간을</div>
        <div className="flex">정해주세요</div>
      </div>

      {/* Day Selector */}
      <div className="flex justify-between px-8 space-x-2 mb-4 mt-8">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-2 py-1 rounded-full ${
              selectedDays.includes(day)
                ? "bg-[#3C4973] text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Time Selector */}
      <div className="flex items-center justify-between px-8 mb-6 justify-center mt-10">
        <div className="text-[#3C4973] mr-2 text-lg">
          <FontAwesomeIcon icon={faClock} />
        </div>

        {/* 시작 시간 입력 */}
        <div className="relative">
          <input
            type="text"
            value={startTime}
            onClick={() => setShowStartTimeSelector(!showStartTimeSelector)}
            readOnly
            className="w-24 text-center border border-gray-300 rounded-lg p-2 cursor-pointer"
          />
          {showStartTimeSelector && (
            <div
              className="absolute top-full left-3 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {timeOptions
                .filter((time) => time !== "23:45") // 23:45 시간 제외
                .map((time) => (
                  <div
                    key={time}
                    onClick={() => selectTime(time, true)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer no-scrollbar"
                  >
                    {time}
                  </div>
                ))}
            </div>
          )}
        </div>

        <span className="mx-2">~</span>

        {/* 종료 시간 입력 */}
        <div className="relative">
          <input
            type="text"
            value={endTime}
            onClick={() => setShowEndTimeSelector(!showEndTimeSelector)}
            readOnly
            className="w-24 text-center border border-gray-300 rounded-lg p-2 cursor-pointer"
          />
          {showEndTimeSelector && (
            <div
              className="absolute top-full left-3 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {getValidEndTimes().map((time) => (
                <div
                  key={time}
                  onClick={() => selectTime(time, false)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer no-scrollbar"
                >
                  {time}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#3752A6] text-white text-md font-semibold rounded-full px-6 py-2"
      >
        등록
      </button>
    </div>
  );
};

export default ScheduleRegist;
