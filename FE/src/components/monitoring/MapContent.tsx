import { useEffect } from "react";
import useHomeStore from "../../stores/useHomeStore";

declare global {
  interface Window {
    kakao: any;
  }
}

const MapContent = () => {
  const HomeData = useHomeStore((state) => state.selectedHome);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map"); // 지도를 표시할 div
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 초기 중심 좌표 (예: 제주도)
          level: 3, // 확대 레벨
        };

        // 지도 생성
        const map = new window.kakao.maps.Map(container, options);

        // Geocoder가 준비되었는지 확인
        if (window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(
            HomeData?.address,
            function (result: any, status: any) {
              if (status === window.kakao.maps.services.Status.OK) {
                const coords = new window.kakao.maps.LatLng(
                  result[0].y,
                  result[0].x
                );

                // 마커를 생성합니다
                const marker = new window.kakao.maps.Marker({
                  map: map,
                  position: coords,
                });

                // 인포윈도우를 생성합니다
                const infowindow = new window.kakao.maps.InfoWindow({
                  content: `<div style="padding:5px;font-size:12px;">${
                    HomeData?.address || "주소 정보 없음"
                  }</div>`,
                });

                // 마커에 클릭이벤트를 등록합니다
                window.kakao.maps.event.addListener(
                  marker,
                  "click",
                  function () {
                    // 마커 위에 인포윈도우를 표시합니다
                    infowindow.open(map, marker);
                  }
                );

                // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                map.setCenter(coords);
              }
            }
          );
        } else {
          console.error(
            "Kakao Maps services 라이브러리가 로드되지 않았습니다."
          );
        }
      });
    } else {
      console.error("Kakao Maps API가 로드되지 않았습니다.");
    }
  }, [HomeData]); // HomeData가 변경될 때마다 실행

  return (
    <div>
      <div className="mt-8 pt-2 border-t-2 rounded-3xl">
        <p className="text-center text-lg font-semibold text-[#3C4973]">
          지도 컨텐츠
        </p>
      </div>
      <div
        id="map"
        style={{ width: "100%", height: "400px", marginTop: "16px" }}
      ></div>
    </div>
  );
};

export default MapContent;
