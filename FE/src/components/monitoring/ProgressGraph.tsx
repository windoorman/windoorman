import { useState, useEffect, useRef, SetStateAction } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useWindowStore from "../../stores/useWindowStore";
import { SensorRecord } from "../../stores/useWindowStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const sensorOptions = [
  { label: "습도", value: 1, unit: "%" },
  { label: "기온", value: 2, unit: "°C" },
  { label: "CO2", value: 3, unit: "ppm" },
  { label: "공기질", value: 4, unit: "ppm" },
  { label: "미세먼지", value: 5, unit: "µg/m³" },
  { label: "초미세먼지", value: 6, unit: "µg/m³" },
];

const rangeOptions = [
  { label: "일", value: 0 },
  { label: "월", value: 1 },
  { label: "년", value: 2 },
];

const ProgressGraph = () => {
  const fetchSensorRecords = useWindowStore(
    (state) => state.fetchSensorRecords
  );
  const [sensor, setSensor] = useState(sensorOptions[0]);
  const [range, setRange] = useState(rangeOptions[0]);
  const [sensorData, setSensorData] = useState<SensorRecord[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch sensor data when sensor or range changes
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSensorRecords(1, sensor.value, range.value);
      setSensorData(data);
    };
    fetchData();
  }, [sensor, range]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSensorSelect = (
    selectedSensor: SetStateAction<{
      label: string;
      value: number;
      unit: string;
    }>
  ) => {
    setSensor(selectedSensor);
    setDropdownOpen(false); // Close dropdown after selection
  };

  const chartData = {
    labels: sensorData.map((record) => record.timestamp),
    datasets: [
      {
        label: `${sensor.label} (${sensor.unit})`, // Add the unit to the label
        data: sensorData.map((record) => record.value),
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        {/* Sensor dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="text-sm font-semibold text-[#3C4973] cursor-pointer flex items-center shadow-none"
          >
            <span className="text-[#3752A6] font-bold">{sensor.label}</span>{" "}
            추이
            <span className="ml-2">▼</span>
          </button>
          {dropdownOpen && (
            <ul className="absolute bg-white border border-gray-300 rounded-md mt-2 w-32 z-10">
              {sensorOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSensorSelect(option)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Range buttons */}
        <div className="flex space-x-2">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option)}
              className={`text-sm shadow-none ${
                range.value === option.value
                  ? "text-[#3752A6] font-bold"
                  : "text-gray-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${context.raw} ${sensor.unit}`, // Add unit in tooltip
                },
              },
            },
            scales: {
              x: {
                display: false,
              },
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ProgressGraph;
