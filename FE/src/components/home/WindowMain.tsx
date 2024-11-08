import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import sadGhost from "../../assets/window/mynaui_sad-ghost-solid.png";
import useWindowStore from "../../stores/useWindowStore";
import openedWindow from "../../assets/window/openedWindow.png";
import closedWindow from "../../assets/window/closedWindow.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import WindowRegist from "./WindowRegist";
import { Home } from "../../stores/useHomeStore";

interface DeviceItem {
  isRegistered: boolean;
  label: string;
  deviceId: string;
}

interface WindowMainProps {
  selectedHome: Home;
}

const WindowMain: React.FC<WindowMainProps> = ({ selectedHome }) => {
  const fetchWindows = useWindowStore((state) => state.fetchWindows);
  const windows = useWindowStore((state) => state.windows);
  const fetchDevices = useWindowStore((state) => state.fetchDevices);
  // const navigate = useNavigate();

  useEffect(() => {
    if (selectedHome.id) {
      fetchWindows(selectedHome.id);
    }
  }, [fetchWindows, selectedHome.id]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<DeviceItem[] | null>(null);
  const [toggleState, setToggleState] = useState<{ [id: string]: boolean }>({});

  const onClickAddWindow = () => {
    setIsModalOpen(true);
    setSearchResult(null);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    const response = await fetchDevices();
    setIsLoading(false);
    setSearchResult(response.length > 0 ? response : null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (selectedHome.id) {
      fetchWindows(selectedHome.id); // 창문 등록 후 업데이트
    }
  };

  const handleToggle = (windowId: number) => {
    setToggleState((prevState) => ({
      ...prevState,
      [windowId]: !prevState[windowId],
    }));
  };

  const navigateMonitoring = () => {};

  const renderNoWindows = () => (
    <div className="mt-8 pt-2 border-t-2 rounded-3xl">
      <div className="px-24">
        <div className="mb-4 mt-16">
          <img src={sadGhost} alt="슬픈 유령" />
        </div>
        <div className="text-[#3C4973] text-2xl font-semibold mb-4">
          <h2>아직 등록된</h2>
          <h2>창문이 없어요!</h2>
        </div>
        <div>
          <button
            onClick={onClickAddWindow}
            className="bg-[#3C4973] rounded-full w-full py-1 mt-4 flex justify-center items-center"
          >
            <span className="text-white text-sm font-semibold">
              창문 등록하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderWindows = () => (
    <div className="mt-8 pt-2 border-t-2 rounded-3xl">
      <div className="px-4 mb-2">
        <div className="flex justify-between">
          <h2 className="text-[#3C4973] text-2xl font-semibold">
            {selectedHome.name}
          </h2>
          <button
            onClick={onClickAddWindow}
            className="bg-[#3C4973] rounded-full w-8 h-8 flex justify-center items-center text-white"
          >
            <FontAwesomeIcon icon={faPlus} className="text-lg" />
          </button>
        </div>
        <div className="max-h-82 overflow-y-auto">
          <ul className="mt-4 grid grid-cols-2 gap-4 mb-4">
            {windows.map((window) => (
              <li
                key={window.windowsid}
                className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md"
              >
                <img
                  src={window.state === "open" ? openedWindow : closedWindow}
                  onClick={navigateMonitoring}
                  alt={`${window.name} 상태`}
                  className="w-16 h-16 mb-2"
                />
                <span className="text-[#3C4973] font-medium mb-2">
                  {window.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    자동 {toggleState[window.windowsid] ? "ON" : "OFF"}
                  </span>
                  <button
                    onClick={() => handleToggle(window.windowsid)}
                    className={`w-10 h-5 rounded-full ${
                      toggleState[window.windowsid]
                        ? "bg-[#FFA500]"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform ${
                        toggleState[window.windowsid]
                          ? "translate-x-5"
                          : "translate-x-0"
                      } transition-transform`}
                    ></div>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {windows.length > 0 ? renderWindows() : renderNoWindows()}
      {isModalOpen && (
        <WindowRegist
          homeId={selectedHome.id ?? 0}
          homeName={selectedHome.name}
          onClose={handleClose}
          onSearch={handleSearch}
          isLoading={isLoading}
          searchResult={searchResult}
        />
      )}
    </div>
  );
};

export default WindowMain;
