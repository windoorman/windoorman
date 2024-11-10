import { useState } from "react";
import CurrentSensor from "./CurrentSensor";
import ProgressGraph from "./ProgressGraph";

const MonitoringMain = () => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn((prevState) => !prevState);
  };

  return (
    <div>
      <div className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1 mt-2 p-8 py-2 pb-1">
        본가
      </div>
      <div className="text-lg text-[#3C4973] font-semibold flex justify-center items-center pb-4 border-b border-dashed border-b-2">
        <div>찬호님의&nbsp;</div>
        <div className="font-bold">창문 1&nbsp;</div>
        <div>정보</div>
      </div>
      {/* 토글 버튼을 중앙에 배치하기 위한 컨테이너 */}
      <div className="flex justify-center mt-4">
        <div
          onClick={handleToggle}
          className="w-24 h-8 rounded-full cursor-pointer bg-gray-300 relative transition-colors duration-300 flex items-center justify-between px-1"
          style={{ backgroundColor: isOn ? "#3752A6" : "#ccc" }}
        >
          <span
            className={`text-white text-xs font-bold transition-opacity duration-300 ${
              isOn ? "opacity-100" : "opacity-0"
            }`}
          >
            자동 ON
          </span>
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              isOn ? "translate-x-8" : "translate-x-0"
            }`}
          ></div>
          <span
            className={`text-white text-xs font-bold transition-opacity duration-300 ${
              isOn ? "opacity-0" : "opacity-100"
            }`}
          >
            자동 OFF
          </span>
        </div>
      </div>
      <div className="flex my-4 px-6 text-[#3C4973] text-lg font-semibold">
        현재 센서 수치
      </div>
      <div className="px-4">
        <CurrentSensor />
      </div>
      <div className="px-6">
        <ProgressGraph />
      </div>
    </div>
  );
};

export default MonitoringMain;
