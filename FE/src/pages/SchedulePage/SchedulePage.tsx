import ScheduleList from "../../components/schedule/ScheduleList";
import { useNavigate } from "react-router-dom";
import useScheduleStore from "../../stores/useScheduleStore";
import { useEffect } from "react";

const schedulePage = () => {
  const navigate = useNavigate();
  const navigateSelect = () => {
    // 일정 등록 페이지로 이동
    navigate("/schedule/select");
  };

  useEffect(() => {
    // 일정 목록 가져오기
    useScheduleStore.getState().fetchSchedules();
  }, []);
  return (
    <div>
      <div className="mt-2 p-8 pb-4">
        <span className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1">
          일정
        </span>
      </div>
      <div>
        <ScheduleList />
      </div>
      <div>
        <div className="fixed bottom-32 left-1/3">
          <button
            onClick={navigateSelect}
            className="bg-[#3752A6] rounded-full py-1"
          >
            <span className="text-white text-sm font-semibold">
              일정 등록하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default schedulePage;
