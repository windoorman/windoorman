import { useEffect } from "react";
import useHomeStore from "../../stores/useHomeStore";

declare global {
  interface Window {
    kakao: any;
  }
}

const MapContent = () => {
  const HomesData = useHomeStore((state) => state.homes);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 초기 중심 좌표
          level: 12,
        };

        const map = new window.kakao.maps.Map(container, options);

        if (window.kakao.maps.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();

          // 각 home에 대해 주소 검색과 마커 생성
          HomesData.forEach((home) => {
            geocoder.addressSearch(
              home.address,
              function (result: any, status: any) {
                if (status === window.kakao.maps.services.Status.OK) {
                  const coords = new window.kakao.maps.LatLng(
                    result[0].y,
                    result[0].x
                  );

                  // 마커 생성
                  const marker = new window.kakao.maps.Marker({
                    map: map,
                    position: coords,
                  });

                  // 인포윈도우 생성
                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;">${home.address}</div>`,
                  });

                  // 마커 클릭 이벤트 추가
                  window.kakao.maps.event.addListener(marker, "click", () => {
                    infowindow.open(map, marker);
                  });

                  // 지도의 중심을 마지막 결과값으로 설정 (혹은 첫 번째 중심 좌표 유지 가능)
                  map.setCenter(coords);
                }
              }
            );
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
    </div>
  );
};

export default MapContent;
