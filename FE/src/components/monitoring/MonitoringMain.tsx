import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // useLocation import
import useWindowStore from "../../stores/useWindowStore";
import useUserStore from "../../stores/useUserStore";
import CurrentSensor from "./CurrentSensor";
import ProgressGraph from "./ProgressGraph";

const MonitoringMain = () => {
  const location = useLocation();
  const windowsId = location.state?.windowsId; // windowsId 가져오기
  const isAuto = location.state?.isAuto; // isAuto 가져오기
  const windowName = location.state?.windowName; // windowName 가져오기
  const [isOn, setIsOn] = useState(isAuto); // isAuto 상태 저장
  const detailWindow = useWindowStore((state) => state.detailWindow);
  const userName = useUserStore((state) => state.userName);
  const autoWindow = useWindowStore((state) => state.autoWindow);

  const handleToggle = () => {
    setIsOn((prevState: any) => !prevState);
    autoWindow(windowsId, !isOn);
  };

  useEffect(() => {
    if (windowsId) {
      const response = detailWindow(windowsId);
      console.log(response);
    }
  }, []);

  return (
    <div>
      <div className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1 mt-2 p-8 py-2 pb-1">
        본가
      </div>
      <div className="text-lg text-[#3C4973] font-semibold flex justify-center items-center pb-4 border-b border-dashed border-b-2">
        <div>{userName}님의&nbsp;</div>
        <div className="font-bold">{windowName}&nbsp;</div>{" "}
        {/* windowsId 출력 */}
        <div>정보</div>
      </div>
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
        <CurrentSensor windowsId={windowsId} />
      </div>
      <div className="px-6">
        <ProgressGraph />
      </div>
    </div>
  );
};

export default MonitoringMain;
