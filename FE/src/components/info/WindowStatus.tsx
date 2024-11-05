import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faAngleDown,
  faAngleUp,
} from "@fortawesome/free-solid-svg-icons";

const WindowStatus = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const windowRecords = [
    { status: "창문 1 열림", time: "2024.10.30 AM 10:00" },
    { status: "창문 1 닫힘", time: "2024.10.30 AM 12:00" },
    { status: "창문 1 열림", time: "2024.10.30 PM 03:00" },
    { status: "창문 1 닫힘", time: "2024.10.30 PM 03:30" },
    { status: "창문 1 열림", time: "2024.10.30 AM 10:00" },
  ];

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="mt-6">
      <div
        onClick={toggleDropdown}
        className={`cursor-pointer flex items-center justify-between text-[#3C4973] text-lg font-semibold py-2 px-4 border-2 rounded-xl ${
          isDropdownOpen ? "bg-gray-200" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faHouse} className="text-[#3C4973]" />
          <span>창문 1</span>
        </div>
        <FontAwesomeIcon icon={isDropdownOpen ? faAngleUp : faAngleDown} />
      </div>

      <div className="bg-gray-50 rounded-b-lg">
        {windowRecords.map((record, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-4 border-b border-gray-200"
          >
            <span className="text-[#3C4973] font-semibold">
              {record.status}
            </span>
            <span className="text-gray-500 text-sm">{record.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WindowStatus;
