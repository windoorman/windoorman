import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHomeStore from "../../stores/useHomeStore";
import { Home } from "../../stores/useHomeStore";
import useWindowStore, { WindowItem } from "../../stores/useWindowStore";

const SelectWindow = () => {
  const homeList = useHomeStore((state) => state.homes);
  const windowList = useWindowStore((state) => state.windows);
  const fetchWindows = useWindowStore((state) => state.fetchWindows);
  const navigate = useNavigate();

  const [isHomeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [isWindowDropdownOpen, setWindowDropdownOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);
  const [selectedWindow, setSelectedWindow] = useState<WindowItem | null>(null);

  const homeDropdownRef = useRef<HTMLDivElement | null>(null);
  const windowDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleHomeDropdownToggle = () =>
    setHomeDropdownOpen(!isHomeDropdownOpen);
  const handleWindowDropdownToggle = () =>
    setWindowDropdownOpen(!isWindowDropdownOpen);

  const handleClickOutside = (event: any) => {
    if (
      homeDropdownRef.current &&
      !homeDropdownRef.current.contains(event.target)
    ) {
      setHomeDropdownOpen(false);
    }
    if (
      windowDropdownRef.current &&
      !windowDropdownRef.current.contains(event.target)
    ) {
      setWindowDropdownOpen(false);
    }
  };

  const handleHomeSelect = (home: Home) => {
    setSelectedHome(home);
    setSelectedWindow(null); // 장소 변경 시 창문 선택 초기화
    setHomeDropdownOpen(false);
    fetchWindows(home.id || 0); // 선택한 장소의 창문 목록을 가져옴
  };

  const handleWindowSelect = (window: WindowItem) => {
    setSelectedWindow(window);
    console.log("Selected window:", window);
    setWindowDropdownOpen(false);
  };

  const navigateToScheduleRegist = () => {
    if (selectedWindow) {
      navigate("/schedule/regist", {
        state: { windowsId: selectedWindow.windowsId },
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div className="text-[#3C4973] font-bold text-2xl ml-8 mt-8">
        <div className="flex">일정을 등록할</div>
        <div className="flex">창문을 선택해 주세요</div>
      </div>

      {/* Home Dropdown */}
      <div
        className="m-4 mt-10 mx-10 p-2 border rounded-xl border-2"
        ref={homeDropdownRef}
      >
        <ul
          onClick={handleHomeDropdownToggle}
          className="text-lg text-[#3C4973] font-semibold flex justify-between items-center space-x-1 cursor-pointer"
        >
          <span>{selectedHome ? selectedHome.name : "장소를 선택하세요"}</span>
          <span className="text-base">{isHomeDropdownOpen ? "▲" : "▼"}</span>
        </ul>
        {isHomeDropdownOpen && (
          <div className="bg-white border border-gray-300 rounded-lg mt-2 w-full shadow-lg">
            {homeList.map((home) => (
              <div
                key={home.id}
                onClick={() => handleHomeSelect(home)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {home.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Window Dropdown */}
      {selectedHome && (
        <div
          className="m-4 mt-4 mx-10 p-2 border rounded-xl border-2"
          ref={windowDropdownRef}
        >
          <ul
            onClick={handleWindowDropdownToggle}
            className="text-lg text-[#3C4973] font-semibold flex justify-between items-center space-x-1 cursor-pointer"
          >
            <span>
              {selectedWindow ? selectedWindow.name : "창문을 선택하세요"}
            </span>
            <span className="text-base">
              {isWindowDropdownOpen ? "▲" : "▼"}
            </span>
          </ul>
          {isWindowDropdownOpen && (
            <div className="bg-white border border-gray-300 rounded-lg mt-2 w-full shadow-lg">
              {windowList.map((window) => (
                <div
                  key={window.windowsId}
                  onClick={() => handleWindowSelect(window)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {window.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next Button */}
      {selectedHome && selectedWindow && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2">
          <button
            onClick={navigateToScheduleRegist}
            className="bg-[#3752A6] rounded-full py-2 px-6"
          >
            <span className="text-white text-md font-semibold">다음</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectWindow;
