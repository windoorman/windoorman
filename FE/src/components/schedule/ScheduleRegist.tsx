import { useLocation } from "react-router-dom";

const ScheduleRegist = () => {
  const location = useLocation();
  const { windowsId } = location.state || {}; // windowsid 값을 받아옵니다.

  return (
    <div>
      <h1>일정 등록 페이지</h1>
      <p>선택된 창문 ID: {windowsId}</p>
    </div>
  );
};

export default ScheduleRegist;
