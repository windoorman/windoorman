import MapContent from "./MapContent";
import useUserStore from "../../stores/useUserStore";

const MonitoringMain = () => {
  const userName = useUserStore((state) => state.userName);
  console.log(userName);
  return (
    <div>
      <div className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1 mt-8 p-8 py-2 pb-1">
        {userName}님
      </div>
      <div className="text-md text-[#3C4973] font-semibold flex items-center ml-8">
        창문 주변 정보를
      </div>
      <div className="text-md text-[#3C4973] font-semibold flex items-center ml-8">
        알려드릴게요!
      </div>
      <div>
        <MapContent />
      </div>
    </div>
  );
};

export default MonitoringMain;
