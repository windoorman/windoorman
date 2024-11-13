import { useEffect } from "react";
import good from "../../assets/monitoring/good.png";
import sunny from "../../assets/monitoring/sunny.png";

interface CurrentSensorProps {
  windowsId: number;
}

const CurrentSensor = ({ windowsId }: CurrentSensorProps) => {
  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:8080/api/sensors/${windowsId}`
    );

    eventSource.addEventListener("sensor", (event) => {
      console.log("sensor event received");
      const data = JSON.parse(event.data);
      console.log("Received data:", data);
    });

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [windowsId]);

  return (
    <div>
      <div className="flex justify-center">
        <div className="border-2 p-4 rounded-xl mr-2 w-3/4">
          <div className="flex justify-between mb-2">
            <div className="text-[#B0B0B0]">습도</div>
            <div className="text-[#3752A6] font-bold">50</div>
            <div className="text-[#5D5D5D]">%</div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="text-[#B0B0B0]">공기질</div>
            <div className="text-[#3752A6] font-bold">0.1</div>
            <div className="text-[#5D5D5D]">ppm</div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="text-[#B0B0B0]">CO2</div>
            <div className="text-[#3752A6] font-bold">0.8</div>
            <div className="text-[#5D5D5D]">ppm</div>
          </div>
          <div className="flex justify-between">
            <div className="text-[#B0B0B0]">기온</div>
            <div className="text-[#3752A6] font-bold">24.1</div>
            <div className="text-[#5D5D5D]">°C</div>
          </div>
        </div>
        <div className="border-2 p-4 rounded-xl w-2/4">
          <div className="flex flex-col items-center mb-2">
            <div>날씨</div>
            <img src={sunny} alt="맑음" className="w-8 h-8" />
          </div>
          <div className="flex flex-col items-center">
            <div>미세먼지</div>
            <img src={good} alt="좋음" className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSensor;
