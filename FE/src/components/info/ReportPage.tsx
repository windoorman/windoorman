import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import DateSelector from "./DateSelector";
import AirStatus from "./AirStatus";
import WindowStatus from "./WindowStatus";
import useWindowStore, {
  AirAnalysisResponse,
} from "../../stores/useWindowStore";
import useHomeStore from "../../stores/useHomeStore";

const ReportPage = () => {
  const airAnalysis = useWindowStore((state) => state.airAnalysis) as (
    placeId: number,
    formattedDate: string
  ) => Promise<AirAnalysisResponse | null>;
  // const location = useLocation();
  // const placeId = location.state.homeId;
  const placeId = 7;
  const placeName = useHomeStore(
    (state) => state.homes.find((home) => home.id === placeId)?.name
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [airReport, setAirReport] = useState<
    AirAnalysisResponse["airReport"] | null
  >(null);

  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    const fetchData = async () => {
      const response: AirAnalysisResponse | null = await airAnalysis(
        placeId,
        formattedDate
      );
      if (response) {
        setAirReport(response.airReport);
      } else {
        setAirReport(null);
      }
    };
    fetchData();
  }, [selectedDate, airAnalysis]);

  return (
    <div className="p-4">
      <div className="p-8 flex border-b-2 border-dashed border-[#B0B0B0] pb-4">
        <span className="text-2xl text-[#3C4973] font-bold">
          {placeName}&nbsp;
        </span>
        <span className="text-2xl text-[#3C4973] font-medium">
          공기 분석 리포트
        </span>
      </div>
      <DateSelector
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <AirStatus airReport={airReport} reportDate={selectedDate} />

      {/* 선택된 날짜를 reportDate로 전달 */}
      <WindowStatus placeId={placeId} reportDate={selectedDate} />
    </div>
  );
};

export default ReportPage;
