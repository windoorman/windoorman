import { useEffect, useState } from "react";
import windowWind from "../../assets/window/창문환기.png";
import HomeMain from "../../components/home/HomeMain";
import Dropdown from "../../components/home/Dropdown";
import useHomeStore from "../../stores/useHomeStore";

const WindowPage = () => {
  // 드롭다운 상태 관리
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // 드롭다운 열기/닫기 토글 함수
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    // 홈 데이터 가져오기
    useHomeStore.getState().fetchHomes();
  }, []);

  return (
    <div>
      <div className="m-4 mt-10 ml-10">
        <ul
          onClick={toggleDropdown}
          className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1"
        >
          <span>홈</span>
          <span className="text-lg">{isDropdownOpen ? "▲" : "▼"}</span>
        </ul>
        {/* 드롭다운 상태에 따라 Dropdown 컴포넌트 표시 */}
        {isDropdownOpen && <Dropdown />}
      </div>
      <div className="mx-8 ">
        <img src={windowWind} alt="창문 환기" />
      </div>
      <HomeMain />
    </div>
  );
};
export default WindowPage;
