# conda install pytorch torchvision torchaudio cudatoolkit=11.2 -c pytorch


#################################################################################
# import time
# from live_anomaly_detection import check_and_actuate_window
# from data_simulator import generate_korean_data

# if __name__ == "__main__":
#     data = generate_korean_data(24 * 60 * 60 // 5)
#     # 온도, 습도, PM10, PM2.5, VOC, eCO₂의 6개 특성 포함
#     indoor_data = data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]]
#     outdoor_data = data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]]

#     while True:
#         # 실시간 데이터를 float16으로 변환하여 추론
#         indoor_data_fp16 = {k: float(v) for k, v in indoor_data.iloc[0].to_dict().items()}
#         outdoor_data_fp16 = {k: float(v) for k, v in outdoor_data.iloc[0].to_dict().items()}
        
#         check_and_actuate_window(indoor_data_fp16, outdoor_data_fp16)
#         time.sleep(10)

##############################################################################
# import time
# from live_anomaly_detection import check_and_actuate_window

# # 실제 센서 데이터를 가져오는 함수 예시 (사용 환경에 맞춰 구현 필요)
# def get_real_time_sensor_data():
#     # 실내외 센서에서 데이터를 가져온다고 가정합니다.
#     indoor_data = {
#         "temperature": 23.5,
#         "humidity": 45.3,
#         "pm10": 80,
#         "pm25": 35,
#         "voc": 250,
#         "eco2": 800
#     }
    
#     outdoor_data = {
#         "temperature": 18.2,
#         "humidity": 60.1,
#         "pm10": 120,
#         "pm25": 50,
#         "voc": 100,
#         "eco2": 450
#     }

#     return indoor_data, outdoor_data

# if __name__ == "__main__":
#     while True:
#         # 실시간 센서 데이터 가져오기
#         indoor_data, outdoor_data = get_real_time_sensor_data()

#         # 추론 및 창문 상태 결정
#         check_and_actuate_window(indoor_data, outdoor_data)
        
#         # 지정된 주기로 실행 (예: 10초)
#         time.sleep(10)

#######################################################################################
import time
from utils import load_config, get_mac_address
from elasticsearch_client import ElasticsearchClient
from live_anomaly_detection import check_and_actuate_window
from springboot_client import send_window_action_to_springboot
from enums import WindowAction
import os

def main_loop(es_client, index_name, springboot_url, mac_address):
    previous_window_status = WindowAction.NO_ACTION
    
    while True:
        indoor_data, outdoor_data = es_client.fetch_latest_sensor_data(index_name)
        
        # 창문 상태와 비트마스크 정보 생성
        current_window_status, issues = check_and_actuate_window(indoor_data, outdoor_data)
        
        if current_window_status != previous_window_status:
            action = "열림" if current_window_status == WindowAction.OPEN else "닫힘"
            # reason_sensor = "실내" if current_window_status == WindowAction.OPEN else "실외"
            
            # Spring Boot 서버에 창문 상태 전송
            send_window_action_to_springboot(mac_address, action, issues, springboot_url)
            
            # 이전 상태 업데이트
            previous_window_status = current_window_status
        
        time.sleep(5)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_dir = os.path.join(current_dir, "configs", "config.yaml")
    
    config = load_config(config_dir)
    es_client = ElasticsearchClient(config)
    index_name = config["elasticsearch"]["index_name"]
    springboot_url = config["springboot"]["url"]
    
    # Raspberry Pi의 MAC 주소 가져오기
    mac_address = get_mac_address()
    
    # 메인 루프 실행
    main_loop(es_client, index_name, springboot_url, mac_address)


