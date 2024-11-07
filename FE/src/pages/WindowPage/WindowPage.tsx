import { useEffect, useRef, useState } from "react";
import windowWind from "../../assets/window/창문환기.png";
import HomeMain from "../../components/home/HomeMain";
import WindowMain from "../../components/home/WindowMain";
import Dropdown from "../../components/home/Dropdown";
import useHomeStore from "../../stores/useHomeStore";

const WindowPage = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const homeList = useHomeStore((state) => state.homes);
  const defaultHome = useHomeStore((state) => state.defaultHome);
  const fetchHomes = useHomeStore((state) => state.fetchHomes);

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
        setIsLoading(true);
        await fetchHomes();
        setIsLoading(false);
      }
    };

    fetchHomesData();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchHomes, homeList.length]);

  // defaultHome이 업데이트될 때 selectedHomeId를 설정
  useEffect(() => {
    if (defaultHome) {
      setSelectedHomeId(defaultHome.id || null);
    }
  }, [defaultHome]);

  const selectedHomeName =
    homeList.find((home) => home.id === selectedHomeId)?.name || "홈";

  const handleHomeSelect = (id: number) => {
    setSelectedHomeId(id);
    setDropdownOpen(false);
  };

  return (
    <div>
      <div className="m-4 mt-10 ml-10" ref={dropdownRef}>
        <ul
          onClick={toggleDropdown}
          className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1"
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <span>{selectedHomeName}</span>
              <span className="text-lg">{isDropdownOpen ? "▲" : "▼"}</span>
            </>
          )}
        </ul>
        {isDropdownOpen && <Dropdown onSelect={handleHomeSelect} />}
      </div>
      <div className="mx-8 ">
        <img src={windowWind} alt="창문 환기" />
      </div>
      {homeList.length > 0 ? (
        <WindowMain
          selectedHomeId={selectedHomeId}
          selectedHomeName={selectedHomeName}
        />
      ) : (
        <HomeMain />
      )}
    </div>
  );
};

export default WindowPage;
