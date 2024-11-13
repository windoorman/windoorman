import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import useScheduleStore from "../../stores/useScheduleStore";

const ScheduleRegist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { windowsId } = location.state || {};

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startHour, setStartHour] = useState("07");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("07");
  const [endMinute, setEndMinute] = useState("15");
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);

  const RegistSchedule = useScheduleStore((state) => state.RegistSchedule);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  const toggleDay = (day: string) => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  const closeModal = () => setShowModal(false);

  const handleRegister = async () => {
    const startTime = `${startHour}:${startMinute}:00`;
    const endTime = `${endHour}:${endMinute}:00`;
    const startTotalMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
    const endTotalMinutes = parseInt(endHour) * 60 + parseInt(endMinute);

    if (selectedDays.length === 0) {
      setModalMessage("요일을 선택해 주세요.");
      setShowModal(true);
      return;
    }

    if (endTotalMinutes <= startTotalMinutes) {
      setModalMessage("종료 시간은 시작 시간 이후로 설정해야 합니다.");
      setShowModal(true);
      return;
    }

    // Sort selectedDays based on daysOfWeek order
    const sortedDays = selectedDays.sort(
      (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
    );

    try {
      await RegistSchedule(windowsId, startTime, endTime, sortedDays);
      setModalMessage("일정이 성공적으로 등록되었습니다.");
      setShowModal(true);
      setTimeout(() => {
        navigate("/schedule");
      }, 1500);
    } catch (error) {
      console.error("일정 등록 실패:", error);
      setModalMessage("일정 등록에 실패했습니다. 다시 시도해 주세요.");
      setShowModal(true);
    }
  };

  // Handle clicks outside to close the time picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        startTimeRef.current &&
        !startTimeRef.current.contains(event.target as Node)
      ) {
        setShowStartTimePicker(false);
      }
      if (
        endTimeRef.current &&
        !endTimeRef.current.contains(event.target as Node)
      ) {
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mt-4">
      <div className="text-[#3C4973] font-bold text-xl text-center mt-8">
        언제 창문을 제어하고 싶나요?
      </div>

      {/* Day Selector */}
      <div className="flex justify-center space-x-2 my-4 mt-8">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`px-3 py-1 rounded-full ${
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
      <div className="flex items-center justify-center space-x-4 my-8 mt-12">
        <div className="text-[#3C4973] text-lg mr-2">
          <FontAwesomeIcon icon={faClock} />
        </div>

        {/* 시작 시간 버튼 */}
        <div ref={startTimeRef} className="relative flex flex-col items-center">
          <button
            onClick={() => {
              setShowStartTimePicker(!showStartTimePicker);
              setShowEndTimePicker(false);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-[#3C4973]"
          >
            {startHour}:{startMinute}
          </button>
          {showStartTimePicker && (
            <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg flex items-center space-x-2">
              <Swiper
                direction="vertical"
                slidesPerView={3}
                centeredSlides={true}
                onSlideChange={(swiper) =>
                  setStartHour(hours[swiper.activeIndex])
                }
                className="h-28 w-16"
              >
                {hours.map((hour) => (
                  <SwiperSlide key={hour}>
                    <div className="text-center text-lg">{hour}</div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <span className="text-lg text-[#3C4973]">:</span>

              <Swiper
                direction="vertical"
                slidesPerView={3}
                centeredSlides={true}
                onSlideChange={(swiper) =>
                  setStartMinute(minutes[swiper.activeIndex])
                }
                className="h-28 w-16"
              >
                {minutes.map((minute) => (
                  <SwiperSlide key={minute}>
                    <div className="text-center text-lg">{minute}</div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        <span>~</span>

        {/* 종료 시간 버튼 */}
        <div ref={endTimeRef} className="relative flex flex-col items-center">
          <button
            onClick={() => {
              setShowEndTimePicker(!showEndTimePicker);
              setShowStartTimePicker(false);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-[#3C4973]"
          >
            {endHour}:{endMinute}
          </button>
          {showEndTimePicker && (
            <div className="absolute top-full right-4 mt-2 p-4 bg-white rounded-lg shadow-lg flex items-center space-x-2">
              <Swiper
                direction="vertical"
                slidesPerView={3}
                centeredSlides={true}
                onSlideChange={(swiper) =>
                  setEndHour(hours[swiper.activeIndex])
                }
                className="h-28 w-16"
              >
                {hours.map((hour) => (
                  <SwiperSlide key={hour}>
                    <div className="text-center text-lg">{hour}</div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <span className="text-lg text-[#3C4973]">:</span>

              <Swiper
                direction="vertical"
                slidesPerView={3}
                centeredSlides={true}
                onSlideChange={(swiper) =>
                  setEndMinute(minutes[swiper.activeIndex])
                }
                className="h-28 w-16"
              >
                {minutes.map((minute) => (
                  <SwiperSlide key={minute}>
                    <div className="text-center text-lg">{minute}</div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>

      {/* Register Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRegister}
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-[#3752A6] text-white text-md font-semibold rounded-full px-6 py-2"
        >
          등록
        </button>
      </div>

      {/* Modal for alerts */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-[#3C4973] mb-4">
              {modalMessage}
            </p>
            <button
              onClick={closeModal}
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

export default ScheduleRegist;
