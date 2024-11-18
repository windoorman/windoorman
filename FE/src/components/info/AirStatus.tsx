import lowTemperature from "../../assets/report/lowTemperature.png";
import highTemperature from "../../assets/report/highTemperature.png";
import humidity from "../../assets/report/humidity.png";
import dust from "../../assets/report/dust.png";
import document from "../../assets/report/document.png";

interface AirStatusProps {
  airReport: {
    reportId: number;
    lowTemperature: number;
    highTemperature: number;
    humidity: number;
    airCondition: number;
  } | null; // null 가능하도록 수정
  reportDate: Date;
}

const AirStatus = ({ airReport, reportDate }: AirStatusProps) => {
  const today = new Date();
  const isToday =
    reportDate.getDate() === today.getDate() &&
    reportDate.getMonth() === today.getMonth() &&
    reportDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return (
      <div className="flex flex-col items-center justify-center mt-6 bg-gray-100 p-4 rounded-lg">
        <img src={document} alt="Document Icon" className="w-12 h-12 mb-4" />
        <span className="text-[#3C4973] font-semibold text-center">
          오늘 대기 정보는 <br /> 내일 확인할 수 있어요!
        </span>
      </div>
    );
  }

  if (!airReport) {
    return (
      <div className="flex justify-center items-center mt-6 bg-gray-100 p-4 rounded-lg">
        <span className="text-[#3C4973] font-semibold">
          이날의 리포트가 존재하지 않습니다!
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-around mt-6 bg-gray-100 p-4 rounded-lg">
      <div className="flex items-center w-1/2 mb-8">
        <img
          src={highTemperature}
          alt="평균 최고 기온"
          className="w-8 h-12 mr-4"
        />
        <div className="flex flex-col items-start">
          <span className="text-sm text-[#3C4973] font-semibold">
            평균 최고 기온
          </span>
          <span className="text-[#3C4973] font-bold">
            {airReport.highTemperature.toFixed(1)}°C
          </span>
        </div>
      </div>
      <div className="flex items-center w-1/2 mb-8">
        <img
          src={lowTemperature}
          alt="평균 최저 기온"
          className="w-8 h-12 mr-4"
        />
        <div className="flex flex-col items-start">
          <span className="text-[#3C4973] font-semibold">평균 최저 기온</span>
          <span className="text-[#3C4973] font-bold">
            {airReport.lowTemperature.toFixed(1)}°C
          </span>
        </div>
      </div>

      <div className="flex items-center w-1/2">
        <img src={humidity} alt="평균 습도" className="w-8 h-10 mr-4" />
        <div className="flex flex-col items-start">
          <span className="text-[#3C4973] font-semibold">평균 습도</span>
          <span className="text-[#3C4973] font-bold">
            {airReport.humidity.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex items-center w-1/2">
        <img src={dust} alt="평균 미세먼지" className="w-8 h-10 mr-4" />
        <div className="flex flex-col items-start">
          <span className="text-[#3C4973] font-semibold">평균 공기질</span>
          <span className="text-[#3C4973] font-bold">
            {airReport.airCondition.toFixed(1)} μg/m³
          </span>
        </div>
      </div>
    </div>
  );
};

export default AirStatus;
