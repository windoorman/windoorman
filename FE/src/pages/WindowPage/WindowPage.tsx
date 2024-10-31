import windowWind from "../../assets/window/창문환기.png";
import sadGhost from "../../assets/window/mynaui_sad-ghost-solid.png";

const WindowPage = () => {
  return (
    <div>
      <div>
        <h1>Window Page</h1>
      </div>
      <div className="mx-8 ">
        <img src={windowWind} alt="창문 환기" />
      </div>
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
            <button className="bg-[#3C4973] rounded-full w-full py-1">
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
export default WindowPage;
