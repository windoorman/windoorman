import { useEffect, useState } from "react";
import good from "../../assets/monitoring/good.png";
import sunny from "../../assets/monitoring/sunny.png";

interface CurrentSensorProps {
  windowsId: number;
}

const CurrentSensor = ({ windowsId }: CurrentSensorProps) => {
  const sensorData = useState({
    humidity: 0,
    voc: 0,
    co2: 0,
    temperature: 0,
    pm25: 0,
    pm10: 0,
  });
  useEffect(() => {
    const eventSource = new EventSource(
      import.meta.env.VITE_API_URL + `/sensors/4`
    );

    eventSource.addEventListener("sensor", (event) => {
      const data = JSON.parse(event.data);
      sensorData[1](data);
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
            <div className="text-[#3752A6] font-bold">
              {sensorData[0].humidity}
            </div>
            <div className="text-[#5D5D5D]">%</div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="text-[#B0B0B0]">Tvoc</div>
            <div className="text-[#3752A6] font-bold">{sensorData[0].voc}</div>
            <div className="text-[#5D5D5D]">ppm</div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="text-[#B0B0B0]">CO2</div>
            <div className="text-[#3752A6] font-bold">{sensorData[0].co2}</div>
            <div className="text-[#5D5D5D]">ppm</div>
          </div>
          <div className="flex justify-between">
            <div className="text-[#B0B0B0]">기온</div>
            <div className="text-[#3752A6] font-bold">
              {sensorData[0].temperature}
            </div>
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
