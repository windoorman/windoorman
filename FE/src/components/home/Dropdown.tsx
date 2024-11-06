import { useNavigate } from "react-router-dom";
import useHomeStore from "../../stores/useHomeStore";

interface DropdownProps {
  onSelect: (id: number) => void;
}

const Dropdown = ({ onSelect }: DropdownProps) => {
  const navigate = useNavigate();
  const homeList = useHomeStore((state) => state.homes);

  const navigateHomeList = () => {
    navigate("/home");
  };

  return (
    <div className="absolute mt-2 bg-white shadow-lg rounded-md w-3/4 p-2 text-[#3C4973]">
      <ul className="divide-y divide-gray-200">
        {homeList.map((home) => (
          <li
            key={home.id}
            onClick={() => onSelect(home.id!)} // 클릭 시 선택된 집의 ID를 전달
            className="hover:bg-gray-100 rounded-md cursor-pointer font-bold flex justify-between items-center p-2"
          >
            <span>{home.name}</span>
            <span className="font-medium text-[#B0B0B0]">
              {home.detailAddress}
            </span>
          </li>
        ))}
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
