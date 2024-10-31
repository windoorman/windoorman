import { useState } from "react";
import windowWind from "../../assets/window/창문환기.png";
import HomeMain from "../../components/home/HomeMain";

const WindowPage = () => {
  // 드롭다운 상태 관리
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // 드롭다운 열기/닫기 토글 함수
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);
  return (
    <div>
      <div className="mt-4">
        <button
          onClick={toggleDropdown}
          className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1"
        >
          <span>홈</span>
          <span>▾</span>
        </button>
      </div>
      <div className="mx-8 ">
        <img src={windowWind} alt="창문 환기" />
      </div>
      <HomeMain />
    </div>
  );
};
export default WindowPage;
