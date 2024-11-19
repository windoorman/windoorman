import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faAngleDown,
  faAngleUp,
} from "@fortawesome/free-solid-svg-icons";
import useWindowStore from "../../stores/useWindowStore";
import { Graph2 } from "./Graph2";

interface WindowStatusProps {
  placeId: number;
  reportDate: Date;
}

const WindowStatus: React.FC<WindowStatusProps> = ({ placeId, reportDate }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<number | null>(null);
  const { windowStates, windowStatus, windowIdSearch, statusGraph } =
    useWindowStore();
  const [windows, setWindows] = useState<{ windowsId: number; name: string }[]>(
    []
  );
  const [graphData, setGraphData] = useState<any>(null); // 그래프 데이터를 저장할 상태
  const [openGraph, setOpenGraph] = useState<number | null>(null); // 현재 열려 있는 actionReportId
  const [loading, setLoading] = useState(false); // 로딩 상태 관리

  // 날짜를 포맷팅하여 API에 전달할 수 있도록 설정
  useEffect(() => {
    const formattedDate = reportDate.toISOString().split("T")[0];
    const fetchWindowStatus = async () => {
      if (selectedWindow !== null) {
        await windowStatus(selectedWindow, formattedDate);
      }
    };
    fetchWindowStatus();
  }, [windowStatus, selectedWindow, reportDate]);

  // 창문 목록을 가져오는 함수
  useEffect(() => {
    const fetchWindows = async () => {
      try {
        const response = await windowIdSearch(placeId);
        setWindows(response.windows);
        if (response.windows.length > 0) {
          setSelectedWindow(response.windows[0].windowsId);
        }
      } catch (error) {
        console.error("Failed to fetch windows:", error);
      }
    };
    fetchWindows();
  }, [placeId, windowIdSearch]);

  // 그래프 데이터를 가져오는 함수
  const getReportGraph = async (actionReportId: number) => {
    try {
      setLoading(true); // 로딩 시작
      if (openGraph === actionReportId) {
        // 같은 actionReportId를 클릭하면 닫기
        setOpenGraph(null);
        setGraphData(null);
      } else {
        const response = await statusGraph(actionReportId);
        setGraphData(response); // 그래프 데이터를 상태로 저장
        setOpenGraph(actionReportId); // 현재 열려 있는 actionReportId를 설정
      }
    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    } finally {
      setLoading(false); // 로딩 완료
    }
  };

  // 드롭다운 열기/닫기 토글 함수
  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // 창문 선택 함수
  const handleWindowSelect = (windowId: number) => {
    setSelectedWindow(windowId);
    setDropdownOpen(false);
  };

  return (
    <div className="mt-6 relative max-h-80 y-scroll-auto">
      {/* 창문 선택 드롭다운 */}
      <div
        onClick={toggleDropdown}
        className={`cursor-pointer flex items-center justify-between text-[#3C4973] text-lg font-semibold py-2 px-4 border-2 rounded-xl ${
          isDropdownOpen ? "bg-gray-200" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faHouse} className="text-[#3C4973]" />
          <span>
            {selectedWindow
              ? `${
                  windows.find((window) => window.windowsId === selectedWindow)
                    ?.name
                }`
              : "창문 선택"}
          </span>
        </div>
        <FontAwesomeIcon icon={isDropdownOpen ? faAngleUp : faAngleDown} />
      </div>

      {/* 창문 목록 드롭다운 */}
      {isDropdownOpen && (
        <div className="bg-gray-50 rounded-b-lg mt-1 py-2 absolute w-full shadow-lg z-10">
          {windows.map((window) => (
            <div
              key={window.windowsId}
              onClick={() => handleWindowSelect(window.windowsId)}
              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
            >
              {window.name}
            </div>
          ))}
        </div>
      )}

      {/* 창문 상태 표시 및 그래프 표시 */}
      <div className="bg-gray-50 rounded-lg mt-4">
        {windowStates.map((record) => (
          <div key={record.actionReportId}>
            <div
              className="flex justify-between items-center py-2 px-4 border-b border-gray-200 cursor-pointer"
              onClick={() => getReportGraph(record.actionReportId)}
            >
              <span className="text-[#3C4973] font-semibold">
                {record.open === "열림" ? "창문 열림" : "창문 닫힘"}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(record.openTime).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>

            {/* 그래프 렌더링 - 로딩 상태 확인 */}
            {openGraph === record.actionReportId && (
              <div className="bg-white p-4">
                {loading ? (
                  <p>Loading...</p> // 로딩 중 메시지 표시
                ) : (
                  graphData && (
                    <Graph2 data={graphData.data} reason={graphData.reason} />
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WindowStatus;
