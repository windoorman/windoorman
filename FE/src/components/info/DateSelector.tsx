import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

interface DateSelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateSelector = ({ selectedDate, setSelectedDate }: DateSelectorProps) => {
  const today = new Date();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0].replace(/-/g, ".");
  };

  // 컴포넌트가 처음 렌더링될 때 어제 날짜를 기본값으로 설정
  useEffect(() => {
    setSelectedDate(today);
  }, [setSelectedDate]);

  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

    // 선택된 날짜가 어제 이전일 때만 다음 날짜로 이동 가능
    if (nextDate <= today) {
      setSelectedDate(nextDate);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-4">
      <FontAwesomeIcon
        icon={faAngleLeft}
        className="text-[#3C4973] cursor-pointer"
        onClick={handlePrevDate}
      />
      <div className="flex items-center space-x-2">
        <FontAwesomeIcon icon={faCalendar} className="text-[#3C4973]" />
        <span className="text-[#3C4973] font-semibold text-lg">
          {formatDate(selectedDate)}
        </span>
      </div>
      <FontAwesomeIcon
        icon={faAngleRight}
        className={`text-[#3C4973] ${
          selectedDate.toDateString() === today.toDateString()
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
        onClick={handleNextDate}
      />
    </div>
  );
};

export default DateSelector;
