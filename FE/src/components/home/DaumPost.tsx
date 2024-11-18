import React from "react";
import DaumPostcode from "react-daum-postcode";

interface DaumPostProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

const DaumPost: React.FC<DaumPostProps> = ({ onComplete, onClose }) => {
  const handleComplete = (data: any) => {
    onComplete(data); // 주소 선택 시 부모 컴포넌트에 데이터 전달
    onClose(); // 모달 닫기
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-80 max-w-full">
        <DaumPostcode onComplete={handleComplete} />
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-300 text-gray-700 rounded-lg"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default DaumPost;
