import { useState, useEffect } from "react";
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
        // null이 아닌 경우에만 처리
        console.log(response); // 응답 데이터를 콘솔에 출력하여 확인
        setAirReport(response.airReport);
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
      {airReport && <AirStatus airReport={airReport} />}
      <WindowStatus />
    </div>
  );
};

export default ReportPage;
