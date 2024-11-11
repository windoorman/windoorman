import { useState } from "react";

type ScheduleItemProps = {
  location: string;
  room: string;
  startTime: string;
  endTime: string;
  days: string[];
  initialEnabled: boolean;
};

const ScheduleItem = ({
  location,
  room,
  startTime,
  endTime,
  days,
  initialEnabled,
}: ScheduleItemProps) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  const toggleSwitch = () => setIsEnabled(!isEnabled);

  return (
    <div className="flex justify-between items-center py-2 px-4 border bg-white rounded-lg shadow-sm mb-2">
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
        onClick={toggleSwitch}
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
  );
};

export default ScheduleItem;
