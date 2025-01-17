import { useNavigate } from "react-router-dom";
import sadGhost from "../../assets/window/mynaui_sad-ghost-solid.png";

const HomeMain = () => {
  const navigate = useNavigate();

  const onClick = () => {
    navigate("/home");
    console.log("집 등록하기 버튼 클릭");
  };

  return (
    <div>
      <div className="mt-8 pt-2 border-t-2 rounded-3xl">
        <div className="px-28">
          <div className=" mb-4 mt-16">
            <img src={sadGhost} alt="슬픈 유령" />
          </div>
          <div className="text-[#3C4973] text-2xl font-semibold mb-4">
            <h2>아직 등록된</h2>
            <h2>집이 없어요!</h2>
          </div>
          <div>
            <button
              onClick={onClick}
              className="bg-[#3752A6] rounded-full w-full py-1 mt-4"
            >
              <span className="text-white text-sm font-semibold">
                집 등록하기
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMain;
