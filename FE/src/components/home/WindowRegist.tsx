import { useState } from "react";
import useWindowStore from "../../stores/useWindowStore";

// DeviceItem 인터페이스 정의
interface DeviceItem {
  isRegistered: boolean;
  label: string;
  deviceId: string;
}

interface WindowRegistProps {
  homeId: number;
  homeName: string;
  onClose: () => void;
  onSearch: () => void;
  isLoading: boolean;
  searchResult: DeviceItem[] | null;
}

const WindowRegist: React.FC<WindowRegistProps> = ({
  homeId,
  homeName,
  onClose,
  onSearch,
  isLoading,
  searchResult,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const RegistDevice = useWindowStore((state) => state.RegistDevice);

  const handleRegister = (device: DeviceItem) => {
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      RegistDevice(device, homeId, homeName);
      setIsRegistered(true);
    }, 1000);
  };

  const handleCloseRegisteredModal = () => {
    setIsRegistered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        {isLoading ? (
          <p className="text-center text-lg font-semibold text-[#3C4973]">
            기기 찾는 중...
          </p>
        ) : isRegistered ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-[#3C4973] mb-4">
              등록되었습니다!
            </p>
            <button
              onClick={handleCloseRegisteredModal}
              className="bg-[#3C4973] text-white px-4 py-2 rounded-lg"
            >
              확인
            </button>
          </div>
        ) : (
          <>
            {searchResult && searchResult.length > 0 ? (
              <>
                <p className="text-center text-lg font-semibold text-[#3C4973] mb-4">
                  주변 기기가 발견되었습니다. 등록하시겠습니까?
                </p>
                <ul className="space-y-4">
                  {searchResult.map((device) => (
                    <li
                      key={device.deviceId}
                      className="flex justify-between items-center p-2 border rounded-lg"
                    >
                      <div>
                        <p className="text-[#3C4973] font-semibold">
                          {device.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          상태: {device.isRegistered ? "등록됨" : "미등록"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRegister(device)}
                        className={`px-3 py-1 rounded-lg ${
                          device.isRegistered
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#3C4973] text-white"
                        }`}
                        disabled={isRegistering || device.isRegistered}
                      >
                        {isRegistering && !device.isRegistered ? (
                          <span className="spinner"></span>
                        ) : (
                          "등록"
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onClose}
                  className="mt-4 bg-gray-300 text-[#3C4973] px-4 py-2 rounded-lg w-full"
                >
                  닫기
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-lg font-semibold text-[#3C4973]">
                  주변 기기를 검색하시겠습니까?
                </p>
                <div className="flex justify-around mt-4">
                  <button
                    onClick={onSearch}
                    className="bg-[#3C4973] text-white px-4 py-2 rounded-lg"
                  >
                    확인
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-300 text-[#3C4973] px-4 py-2 rounded-lg"
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {!isLoading && searchResult !== null && searchResult.length === 0 && (
          <p className="text-center text-sm text-red-500 mt-4">
            주변 기기가 없습니다!
          </p>
        )}
      </div>
    </div>
  );
};

export default WindowRegist;
