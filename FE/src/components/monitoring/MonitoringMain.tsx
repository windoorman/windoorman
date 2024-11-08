import MapContent from "./MapContent";
import useUserStore from "../../stores/useUserStore";

const MonitoringMain = () => {
  const userName = useUserStore((state) => state.userName);
  return (
    <div>
      <span className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1 mt-2 p-8">
        ${userName}님의 모니터링
      </span>
      <div>
        <MapContent />
      </div>
    </div>
  );
};

export default MonitoringMain;
