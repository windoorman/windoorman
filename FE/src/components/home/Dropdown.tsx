import { useNavigate } from "react-router-dom";

const Dropdown = () => {
  const navigate = useNavigate();
  const navigateHomeList = () => {
    navigate("/home");
  };
  return (
    <div className="absolute mt-2 bg-white shadow-lg rounded-md w-3/4 p-2 text-[#3C4973]">
      <ul className="divide-y divide-gray-200">
        <li className="hover:bg-gray-100 rounded-md cursor-pointer font-bold flex justify-between items-center p-2">
          <span>우리 집</span>
          <span className="font-medium text-[#B0B0B0]">
            싸피아파트 107동 107호
          </span>
        </li>
        <li
          onClick={navigateHomeList}
          className="hover:bg-gray-100 rounded-md cursor-pointer font-bold p-2 flex justify-start"
        >
          + 집 등록하기
        </li>
      </ul>
    </div>
  );
};

export default Dropdown;
