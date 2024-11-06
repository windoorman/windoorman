import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useHomeStore, { Home } from "../../stores/useHomeStore";

const HomeList = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const homes = useHomeStore((state) => state.homes);
  const deleteHome = useHomeStore((state) => state.deleteHome);
  const navigate = useNavigate();
  const emptyHome = homes.length === 0;

  const navigateHomeRegist = () => {
    navigate("/home/regist");
  };

  const navigateToUpdate = (home: Home) => {
    navigate("/home/update", { state: { home } });
  };

  const openDeleteModal = (id: number) => {
    setSelectedHomeId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedHomeId(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedHomeId !== null) {
      deleteHome(selectedHomeId);
    }
    closeDeleteModal();
  };

  return (
    <div className="">
      <div className="mt-2 p-8">
        <span className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1">
          집 목록
        </span>
      </div>
      <div>
        <button
          onClick={navigateHomeRegist}
          className="bg-[#3752A6] rounded-3xl w-1/3 py-1 mt-4"
        >
          <span className="text-white text-sm font-semibold">집 등록하기</span>
        </button>
      </div>
      <div className="mt-8 pt-2 border-t-2 rounded-3xl">
        {emptyHome && (
          <div className="px-24">
            <div className="text-[#3C4973] text-2xl font-semibold mb-4 mt-16">
              <h2>아직 등록된</h2>
              <h2>집이 없어요!</h2>
            </div>
          </div>
        )}
        <ul>
          {homes.map((home, index) => (
            <li
              key={index}
              className="rounded-md cursor-pointer font-bold p-4 mb-2 border-b"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[#3C4973]">{home.name}</span>
                  {home.isDefault && (
                    <span className="text-xs bg-[#3752A6] text-white rounded-full px-2 py-0.5">
                      기본
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-[#B0B0B0] text-sm">
                  {home.detailAddress}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigateToUpdate(home)}
                    className="text-[#3752A6] border border-[#3752A6] rounded px-2 py-1 text-xs font-semibold shadow-none"
                  >
                    수정
                  </button>
                  {!home.isDefault && (
                    <button
                      onClick={() => openDeleteModal(home.id!)}
                      className="text-[#E65B5B] border border-[#E65B5B] rounded px-2 py-1 text-xs font-semibold shadow-none"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-center text-lg font-semibold text-[#3C4973] mb-4">
              정말 삭제하시겠습니까?
            </p>
            <p className="text-center text-sm text-[#B0B0B0]">
              삭제하면 기존 연동한 창문의 정보는 모두
            </p>
            <p className="text-center text-sm text-[#B0B0B0] mb-4">
              삭제되며 복구되지 않습니다.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-[#E65B5B] text-white px-4 py-2 rounded-lg font-semibold shadow-none"
              >
                삭제
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-[#3C4973] px-4 py-2 rounded-lg font-semibold shadow-none"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeList;
