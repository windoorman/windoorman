import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";

const DateSelector = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0].replace(/-/g, ".");
  };

  const handlePrevDate = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prevDate);
  };

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);

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
        className={`text-[#3C4973] cursor-pointer ${
          selectedDate.toDateString() === today.toDateString()
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={handleNextDate}
      />
    </div>
  );
};

export default DateSelector;
