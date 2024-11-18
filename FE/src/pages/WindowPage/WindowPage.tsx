import { useEffect, useRef, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader"; // 로딩 스피너 임포트
import windowWind from "../../assets/window/창문환기.png";
import HomeMain from "../../components/home/HomeMain";
import WindowMain from "../../components/home/WindowMain";
import Dropdown from "../../components/home/Dropdown";
import useHomeStore from "../../stores/useHomeStore";

const WindowPage = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const dropdownRef = useRef<HTMLDivElement>(null);

  const homeList = useHomeStore((state) => state.homes);
  const defaultHome = useHomeStore((state) => state.defaultHome);
  const selectedHome = useHomeStore((state) => state.selectedHome);
  const fetchHomes = useHomeStore((state) => state.fetchHomes);
  const setSelectedHome = useHomeStore((state) => state.setSelectedHome);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const fetchHomesData = async () => {
      if (homeList.length === 0) {
        setIsLoading(true); // 로딩 시작
        await fetchHomes();
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchHomesData();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchHomes, homeList.length]);

  useEffect(() => {
    if (defaultHome && !selectedHome) {
      setSelectedHome(defaultHome);
    }
  }, [defaultHome, selectedHome, setSelectedHome]);

  const handleHomeSelect = (id: number) => {
    const selected = homeList.find((home) => home.id === id);
    if (selected) setSelectedHome(selected);
    setDropdownOpen(false);
  };

  return (
    <div>
      {isLoading ? (
        // 로딩 스피너 표시
        <div className="flex justify-center items-center h-screen">
          <SyncLoader color="#3752A6" />
        </div>
      ) : (
        <>
          <div className="m-4 mt-10 ml-10" ref={dropdownRef}>
            <ul
              onClick={toggleDropdown}
              className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1"
            >
              <>
                <span>{selectedHome ? selectedHome.name : "홈"}</span>
                <span className="text-lg">{isDropdownOpen ? "▲" : "▼"}</span>
              </>
            </ul>
            {isDropdownOpen && <Dropdown onSelect={handleHomeSelect} />}
          </div>
          <div className="mx-8">
            <img src={windowWind} alt="창문 환기" />
          </div>
          {homeList.length > 0 && selectedHome ? (
            <WindowMain selectedHome={selectedHome} />
          ) : (
            <HomeMain />
          )}
        </>
      )}
    </div>
  );
};

export default WindowPage;
