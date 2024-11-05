import lowTemperature from "../../assets/report/lowTemperature.png";
import highTemperature from "../../assets/report/highTemperature.png";
import humidity from "../../assets/report/humidity.png";
import dust from "../../assets/report/dust.png";

const AirStatus = () => {
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
          <span className="text-[#3C4973] font-bold">20.8°C</span>
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
          <span className="text-[#3C4973] font-bold">13.1°C</span>
        </div>
      </div>

      <div className="flex items-center w-1/2">
        <img src={humidity} alt="평균 습도" className="w-8 h-10 mr-4" />
        <div className="flex flex-col items-start">
          <span className="text-[#3C4973] font-semibold">평균 습도</span>
          <span className="text-[#3C4973] font-bold">45%</span>
        </div>
      </div>
      <div className="flex items-center w-1/2">
        <img src={dust} alt="평균 미세먼지" className="w-8 h-10 mr-4" />
        <div className="flex flex-col items-start">
          <span className="text-[#3C4973] font-semibold">평균 미세먼지</span>
          <span className="text-[#3C4973] font-bold">22 μg/m³</span>
        </div>
      </div>
    </div>
  );
};

export default AirStatus;
