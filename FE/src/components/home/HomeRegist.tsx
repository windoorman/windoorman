import { useState } from "react";
import myHome from "../../assets/window/myHome.png";
import company from "../../assets/window/company.png";
import building from "../../assets/window/building.png";
import DaumPost from "./DaumPost";

const HomeRegist = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [basicAddress, setBasicAddress] = useState("");

  const handleSelect = (label: string) => {
    setSelected(label);
    setIsReadOnly(label !== "직접입력");
    setInputValue(label !== "직접입력" ? label : "");
  };

  const handleInputChange = (e: { target: { value: string } }) => {
    const value = e.target.value;
    if (value.length <= 5) {
      setInputValue(value);
    }
  };

  const handleAddressSelect = (data: any) => {
    setBasicAddress(data.address); // 기본 주소 설정
  };

  return (
    <div>
      <div className="mt-2 p-8">
        <span className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1">
          집 등록
        </span>
      </div>
      <div>
        <button
          className="bg-[#3752A6] rounded-3xl w-1/3 py-1 mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-white text-sm font-semibold">주소 검색</span>
        </button>
      </div>
      <div className="mt-8 pt-2 border-t-2 rounded-3xl">
        <div className="mx-10">
          <div>
            <span className="text-[#3C4973] text-xl font-semibold">
              <h2>집 정보를 입력해주세요</h2>
            </span>
          </div>
          <div className="mb-4 mt-4">
            <input
              type="text"
              className="shadow-md w-full"
              placeholder="기본 주소(주소 검색)"
              value={basicAddress}
              readOnly
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              className="shadow-md w-full"
              placeholder="상세 주소"
            />
          </div>

          {/* 이미지 버튼들 */}
          <div className="flex justify-around mt-4">
            <div
              onClick={() => handleSelect("우리집")}
              className={`flex flex-col items-center p-2 border-2 rounded-xl cursor-pointer ${
                selected === "우리집" ? "border-[#3752A6] bg-gray-200" : ""
              }`}
            >
              <img src={myHome} alt="우리집" className="w-16 h-16" />
              <span className="text-sm font-medium text-[#3C4973]">우리집</span>
            </div>
            <div
              onClick={() => handleSelect("회사")}
              className={`flex flex-col items-center p-2 border-2 rounded-xl cursor-pointer ${
                selected === "회사" ? "border-[#3752A6] bg-gray-200" : ""
              }`}
            >
              <img src={company} alt="회사" className="w-16 h-16" />
              <span className="text-sm font-medium text-[#3C4973]">회사</span>
            </div>
            <div
              onClick={() => handleSelect("직접입력")}
              className={`flex flex-col items-center p-2 border-2 rounded-xl cursor-pointer ${
                selected === "직접입력" ? "border-[#3752A6] bg-gray-200" : ""
              }`}
            >
              <img src={building} alt="직접입력" className="w-16 h-16" />
              <span className="text-sm font-medium text-[#3C4973]">
                직접입력
              </span>
            </div>
          </div>

          <div className="mb-4 mt-4">
            <input
              type="text"
              className="shadow-md w-full text-[#3C4973] text-md"
              placeholder="예) 자취"
              value={inputValue}
              onChange={handleInputChange}
              readOnly={isReadOnly}
            />
          </div>
          <div className="mt-8 flex justify-center">
            <button className="bg-[#3752A6] rounded-full w-1/2 py-1">
              <span className="text-white text-sm font-semibold">
                집 등록하기
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* DaumPost 모달 */}
      {isModalOpen && (
        <DaumPost
          onComplete={handleAddressSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HomeRegist;
