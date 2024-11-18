import requests
from datetime import datetime
from enums import WindowAction

def send_window_action_to_springboot(mac_address, open_status, issues, springboot_url, open_url, close_url, window_id=4):
    """
    Spring Boot 서버에 창문 개폐 등록 요청을 전송합니다.
    :param mac_address: Raspberry Pi의 MAC 주소
    :param open_status: "열림" 또는 "닫힘" 상태
    :param reason: 창문 개폐의 원인이 된 센서 이름
    :param springboot_url: Spring Boot 서버 URL
    """
    payload = {
        "windowsId": window_id,
        "open": open_status,
        "openTime": datetime.now().isoformat(),
        "reason": issues
    }

    headers = {
        "Content-Type": "application/json",
        "mac" : mac_address
    }
    print(f"보냅니다!!!!!!!!!!!!!!!!!!!!!! {payload}")
    
    try:
        response = requests.post(springboot_url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"[INFO] 창문 개폐 등록이 성공적으로 전송되었습니다: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Spring Boot 서버로 창문 개폐 등록 요청 실패: {e}")

    try:
        if open_status == "open":
            response = requests.get(f"{open_url}{window_id}", headers=headers)
        else:
            response = requests.get(f"{close_url}{window_id}", headers=headers)
        print(f"[INFO] 창문 개폐 요청이 성공적으로 전송되었습니다: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Spring Boot 서버로 창문 개폐 요청 실패: {e}")



def get_window_status(mac_address, status_url, window_id=4):
    headers = {
        "Content-Type": "application/json",
        "mac": mac_address
    }

    try:
        response = requests.get(f"{status_url}{window_id}", headers=headers)
        if response.ok:
            window_status = response.text.strip()  # 'open' 또는 'close' 텍스트만 가져옵니다
            print(f"[INFO] 현재 창문 상태입니다: {window_status}")
            window_status = WindowAction.OPEN if window_status == "open" else WindowAction.CLOSE
            return window_status
        else:
            print(f"[ERROR] 서버 응답 오류: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Spring Boot 서버로 창문 개폐 요청 실패: {e}")
        return None