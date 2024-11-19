import time
import torch
from utils import load_config, get_mac_address, calculate_date
from elasticsearch_client import ElasticsearchClient
from live_anomaly_detection import check_and_actuate_window
from springboot_client import send_window_action_to_springboot, get_window_status
from enums import WindowAction
import os

# 실내외 데이터를 사용해 현재 값과 직전 값의 차이를 모델에 입력하도록 수정된 main_loop
def main_loop(es_client, index_name, springboot_url, mac_address, open_url, close_url, status_url, windows_id):
    previous_window_status = WindowAction.NO_ACTION
    previous_data = {"indoor": None, "outdoor": None}  # 이전 데이터를 저장할 변수
    
    while True:
        # 최신 실내외 데이터 가져오기
        indoor_data, outdoor_data = es_client.fetch_latest_sensor_data(index_name)
        
        # 직전 데이터가 없으면 현재 데이터 저장하고 다음 루프로 이동
        if previous_data["indoor"] is None or previous_data["outdoor"] is None:
            previous_data["indoor"] = indoor_data
            previous_data["outdoor"] = outdoor_data
            time.sleep(5)
            continue

        # 현재 값과 직전 값의 차이 계산
        # diff_indoor = {sensor: indoor_data[sensor] - previous_data["indoor"][sensor] for sensor in indoor_data}
        # diff_outdoor = {sensor: outdoor_data[sensor] - previous_data["outdoor"][sensor] for sensor in outdoor_data}

        # 차이 데이터를 모델에 입력하기 위한 텐서로 변환
        # diff_indoor_tensor = torch.tensor(list(diff_indoor.values()), dtype=torch.float32).unsqueeze(0)
        # diff_outdoor_tensor = torch.tensor(list(diff_outdoor.values()), dtype=torch.float32).unsqueeze(0)
        
        # 모델을 통해 이상치 여부 확인
        current_window_status, issues = check_and_actuate_window(indoor_data, outdoor_data, previous_data)
        window_server_status = get_window_status(mac_address, status_url, windows_id)
        # 창문 상태가 변경되었을 경우에만 서버로 전송
        # if current_window_status != previous_window_status or current_window_status != window_server_status:
        if window_server_status == None or current_window_status != window_server_status:
            action = "open" if current_window_status == WindowAction.OPEN else "close"
            send_window_action_to_springboot(mac_address, action, issues, springboot_url, open_url, close_url, windows_id)
            previous_window_status = current_window_status
        
        # 직전 데이터를 현재 데이터로 업데이트
        previous_data["indoor"] = indoor_data
        previous_data["outdoor"] = outdoor_data
        
        time.sleep(5)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_dir = os.path.join(current_dir, "configs", "config.yaml")
    
    config = load_config(config_dir)
    es_client = ElasticsearchClient(config)
    # index_name = config["elasticsearch"]["index_name"]
    springboot_url = config["springboot"]["url"]
    open_url = config["springboot"]["open_url"]
    close_url = config["springboot"]["close_url"]
    status_url = config["springboot"]["status_url"]
    windows_id = config["springboot"]["windows_id"]
    index_name = calculate_date(windows_id, config["springboot"]["home_id"])
    print(index_name)

    # Raspberry Pi의 MAC 주소 가져오기
    mac_address = get_mac_address()

    
    # 메인 루프 실행
    main_loop(es_client, index_name, springboot_url, mac_address, open_url, close_url, status_url, windows_id)