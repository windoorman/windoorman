import DateSelector from "./DateSelector";
import AirStatus from "./AirStatus";
import WindowStatus from "./WindowStatus";

const ReportPage = () => {
  return (
    <div className="p-4">
      <div className="p-8 flex border-b-2 border-dashed border-[#B0B0B0] pb-4">
        <span className="text-2xl text-[#3C4973] font-bold">자취&nbsp;</span>
        <span className="text-2xl text-[#3C4973] font-medium">
          근처 공기 분석 리포트
        </span>
      </div>
      <DateSelector />
      <AirStatus />
      <WindowStatus />
    </div>
  );
};

export default ReportPage;
