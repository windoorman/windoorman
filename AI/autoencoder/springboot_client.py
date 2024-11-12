import requests
from datetime import datetime

def send_window_action_to_springboot(mac_address, open_status, issues, springboot_url):
    """
    Spring Boot 서버에 창문 개폐 등록 요청을 전송합니다.
    :param mac_address: Raspberry Pi의 MAC 주소
    :param open_status: "열림" 또는 "닫힘" 상태
    :param reason: 창문 개폐의 원인이 된 센서 이름
    :param springboot_url: Spring Boot 서버 URL
    """
    payload = {
        "windowsId": mac_address,
        "open": open_status,
        "openTime": datetime.now().isoformat(),
        "reason": issues
    }
    
    try:
        response = requests.post(springboot_url, json=payload)
        response.raise_for_status()
        print(f"[INFO] 창문 개폐 등록이 성공적으로 전송되었습니다: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Spring Boot 서버로 창문 개폐 등록 요청 실패: {e}")