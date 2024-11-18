import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScheduleList from "../../components/schedule/ScheduleList";
import useScheduleStore from "../../stores/useScheduleStore";
import SyncLoader from "react-spinners/SyncLoader"; // 로딩 스피너 임포트

const SchedulePage = () => {
  const navigate = useNavigate();
  const navigateSelect = () => {
    // 일정 등록 페이지로 이동
    navigate("/schedule/select");
  };

  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    // 일정 목록 가져오기
    const fetchData = async () => {
      await useScheduleStore.getState().fetchSchedules();
      setIsLoading(false); // 로딩 완료 시 로딩 상태 업데이트
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="mt-2 p-8 pb-4">
        <span className="text-2xl text-[#3C4973] font-bold flex items-center space-x-1">
          일정
        </span>
      </div>
      {isLoading ? (
        // 로딩 중일 때 로딩 스피너 표시
        <div className="flex justify-center items-center">
          <SyncLoader color="#3752A6" />
        </div>
      ) : (
        // 로딩이 완료되면 ScheduleList 컴포넌트 표시
        <div>
          <ScheduleList />
        </div>
      )}
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

export default SchedulePage;
