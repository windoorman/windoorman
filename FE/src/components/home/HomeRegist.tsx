import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useHomeStore from "../../stores/useHomeStore";
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
  const [detailAddress, setDetailAddress] = useState("");
  const [isDefaultHome, setIsDefaultHome] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // 성공 모달 상태

  const navigate = useNavigate();
  const { RegistHome } = useHomeStore();

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
    setBasicAddress(data.address);
  };

  const handleSubmit = async () => {
    if (basicAddress === "" || detailAddress === "" || inputValue === "") {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const home = {
      address: basicAddress,
      detailAddress: detailAddress,
      name: inputValue,
      isDefault: isDefaultHome,
    };

    setIsLoading(true); // 로딩 시작

    try {
      await RegistHome(home);
      setIsLoading(false); // 로딩 종료
      setIsSuccessModalOpen(true); // 성공 모달 열기
    } catch (error) {
      setIsLoading(false); // 로딩 종료
      console.error("Failed to regist home:", error);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/window");
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
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
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

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={isDefaultHome}
              onChange={() => setIsDefaultHome(!isDefaultHome)}
              className="w-4 h-4 text-[#3752A6] rounded"
            />
            <label className="text-sm text-[#3C4973] font-semibold">
              기본 집으로 설정
            </label>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-[#3752A6] rounded-full w-1/2 py-1"
            >
              <span className="text-white text-sm font-semibold">
                {isLoading ? "등록 중..." : "집 등록하기"}
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

      {/* 성공 모달 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-center text-lg font-semibold text-[#3C4973]">
              집 등록이 완료되었습니다!
            </p>
            <button
              onClick={closeSuccessModal}
              className="mt-4 w-full py-2 bg-[#3752A6] text-white rounded-lg font-semibold"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeRegist;
