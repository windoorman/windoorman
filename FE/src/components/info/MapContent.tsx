import { useEffect, useState } from "react";
import useHomeStore from "../../stores/useHomeStore";
import axiosApi from "../../instance/axiosApi";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    kakao: any;
  }
}

const MapContent = () => {
  const HomesData = useHomeStore((state) => state.homes);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [showReportButton, setShowReportButton] = useState(false);
  const [homeId, setHomeId] = useState<number | null>(null);
  const navigate = useNavigate();

  const navigateReport = () => {
    navigate("/report", { state: { homeId } });
  };

  const fetchAvgActions = async (placeId: number) => {
    try {
      setHomeId(placeId);
      const response = await axiosApi.get(`/actions/avg/${placeId}`);
      const avgActions = response.data.avgActions;

      if (avgActions === 0) {
        setModalContent("이슈가 없습니다.");
        setShowReportButton(false);
      } else {
        setModalContent(
          `지난 7일간 창문이 자동으로 평균 ${avgActions.toFixed(
            1
          )}회 열렸습니다.`
        );
        setShowReportButton(true);
      }
    } catch (error) {
      console.error("평균 액션 정보를 가져오는 중 오류 발생:", error);
      setModalContent("집에 등록된 창문이 없습니다!");
      setShowReportButton(false);
    }
  };

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667),
          level: 12,
        };

        const map = new window.kakao.maps.Map(container, options);

        if (window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();

          HomesData.forEach((home) => {
            geocoder.addressSearch(home.address, (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(
                  result[0].y,
                  result[0].x
                );

                const marker = new window.kakao.maps.Marker({
                  map: map,
                  position: coords,
                });

                const infowindow = new window.kakao.maps.InfoWindow({
                  content: `<div style="padding:5px;font-size:12px;">${home.address}</div>`,
                });

                window.kakao.maps.event.addListener(marker, "click", () => {
                  infowindow.open(map, marker);
                  fetchAvgActions(home.id ?? 0);
                });

                map.setCenter(coords);
              }
            });
          });
        } else {
          console.error(
            "Kakao Maps services 라이브러리가 로드되지 않았습니다."
          );
        }
      });
    } else {
      console.error("Kakao Maps API가 로드되지 않았습니다.");
    }
  }, [HomesData]);

  return (
    <div>
      <div className="mt-8 pt-2 border-t-2 rounded-3xl"></div>
      <div
        id="map"
        style={{ width: "100%", height: "400px", marginTop: "16px" }}
      ></div>

      {/* 모달 형식으로 메시지 표시 */}
      {modalContent && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-80 z-50 bg-white p-4 shadow-lg text-center rounded-lg">
          <p>{modalContent}</p>
          {showReportButton && (
            <button
              onClick={navigateReport} // 리포트 보기 클릭 시 이동할 URL
              className="mt-4 bg-[#3C4973] text-white py-2 px-4 rounded-lg"
            >
              리포트 보기
            </button>
          )}
          <button
            onClick={() => setModalContent(null)}
            className="mt-2 text-blue-500 shadow-none"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};

export default MapContent;
