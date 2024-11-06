import { Link, useLocation } from "react-router-dom";
import Home from "../../assets/navbar/Home.png";
import ActiveHome from "../../assets/navbar/ActiveHome.png";
import Calender from "../../assets/navbar/Calendar.png";
import ActiveCalender from "../../assets/navbar/ActiveCalendar.png";
import Profile from "../../assets/navbar/Profile.png";
import ActiveProfile from "../../assets/navbar/ActiveProfile.png";

const Navbar = () => {
  const locationNow = useLocation();

  const buttons = [
    {
      paths: ["/window", "/home", "/home/regist", "/home/update"], // 여러 경로를 배열로 설정
      label: "홈",
      icon: Home,
      activeIcon: ActiveHome,
    },
    {
      paths: ["/schedule"],
      label: "일정",
      icon: Calender,
      activeIcon: ActiveCalender,
    },
    {
      paths: ["/info", "/report"],
      label: "정보",
      icon: Profile,
      activeIcon: ActiveProfile,
    },
  ];

  // 현재 경로에 따라 아이콘과 텍스트 스타일 결정
  const getIconAndStyle = (
    paths: string | string[],
    icon: string,
    activeIcon: string
  ) => {
    const isActive = paths.includes(locationNow.pathname); // 현재 경로가 paths 배열에 포함되는지 확인
    return {
      iconSrc: isActive ? activeIcon : icon,
      textColor: isActive ? "text-[#3752A6]" : "text-[#B0B0B0]",
    };
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center py-4 pb-6 shadow-t border-t w-full mx-auto">
      {buttons.map((button) => {
        const { iconSrc, textColor } = getIconAndStyle(
          button.paths,
          button.icon,
          button.activeIcon
        );
        return (
          <Link
            key={button.label}
            to={button.paths[0]} // 주 경로로 이동
            className="flex flex-col items-center"
          >
            <img
              src={iconSrc}
              alt={`${button.label} Icon`}
              className="w-8 h-8"
            />
            <span className={`${textColor} text-sm font-medium`}>
              {button.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
