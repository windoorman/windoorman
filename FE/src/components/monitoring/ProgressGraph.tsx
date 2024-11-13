import { useState, useRef, useEffect } from "react";

const ProgressGraph = () => {
  const sensorOptions = [
    "습도",
    "기온",
    "co2",
    "공기질",
    "미세먼지",
    "초미세먼지",
  ];
  const [selectedSensor, setSelectedSensor] = useState(sensorOptions[0]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleSensorSelect = (sensor: string) => {
    setSelectedSensor(sensor);
    setDropdownOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={toggleDropdown}
          className="text-lg font-semibold text-[#3C4973] cursor-pointer py-2 flex items-center "
        >
          <span>{selectedSensor} 변화 추이</span>
          <span className="ml-2 text-sm">{isDropdownOpen ? "▲" : "▼"}</span>
        </div>
        {isDropdownOpen && (
          <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full z-10">
            {sensorOptions.map((sensor) => (
              <li
                key={sensor}
                onClick={() => handleSensorSelect(sensor)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                {sensor}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 그래프 표시 영역 */}
      <div className="mt-6">
        {/* 그래프 컴포넌트나 그래프 로직 추가 가능 */}
      </div>
    </div>
  );
};

export default ProgressGraph;
