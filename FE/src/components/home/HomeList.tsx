import { useNavigate } from "react-router-dom";

const HomeList = () => {
  const homes = [
    { type: "자취", address: "대전 유성구 동서대로 98-39", isDefault: true },
    { type: "본가", address: "대전 유성구 동서대로 98-39", isDefault: false },
    { type: "자취", address: "대전 유성구 동서대로 98-39", isDefault: false },
    { type: "자취", address: "대전 유성구 동서대로 98-39", isDefault: false },
  ];

  const navigate = useNavigate();

  const navigateHomeRegist = () => {
    navigate("/home/regist");
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
        <ul>
          {homes.map((home, index) => (
            <li
              key={index}
              className="rounded-md cursor-pointer font-bold p-4 mb-2 border-b"
            >
              {/* 첫 번째 줄: 타입과 기본 라벨 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[#3C4973]">{home.type}</span>
                  {home.isDefault && (
                    <span className="text-xs bg-[#3752A6] text-white rounded-full px-2 py-0.5">
                      기본
                    </span>
                  )}
                </div>
              </div>

              {/* 두 번째 줄: 주소와 버튼 */}
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-[#B0B0B0] text-sm">
                  {home.address}
                </span>
                <div className="flex space-x-2">
                  <button className="text-[#3752A6] border border-[#3752A6] rounded px-2 py-1 text-xs font-semibold shadow-none">
                    수정
                  </button>
                  <button className="text-[#3752A6] border border-[#3752A6] rounded px-2 py-1 text-xs font-semibold shadow-none">
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomeList;
