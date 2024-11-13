import yaml
import uuid
from enums import AnomalyStatus

# 센서 임계값 설정
sensor_thresholds = {
    "temperature": 36, #30,   # 예: 30°C 이상일 경우 이상으로 간주
    "humidity": 90, #70,      # 예: 70% 이상일 경우 이상으로 간주
    "pm10": 100,
    "pm25": 50,
    "voc": 200,
    "eco2": 1000
}


# 표준화된 임계치 예제 (각 센서별 평균과 표준편차 기반)
standardized_thresholds = {
    "temperature": (30 - 20) / 5,  # 각 센서에 맞게 설정
    "humidity": (70 - 50) / 10,
    "pm10": (100 - 60) / 20,
    "pm25": (50 - 35) / 10,
    "voc": (200 - 100) / 50,
    "eco2": (1000 - 600) / 100,
}

# 급격한 변화 속도 임계값 설정
rapid_change_threshold = {
    "temperature": 5,    # 예: 5°C 이상의 급격한 변화 시 감지
    "humidity": 10,      # 예: 10% 이상의 급격한 변화 시 감지
    "pm10": 20,
    "pm25": 10,
    "voc": 30,
    "eco2": 100
}

sensor_names = ["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]

def interpret_bitmask(indoor_bitmask, outdoor_bitmask):
    global sensor_names
    """
    실내 및 실외 비트마스크를 해석하여 각 센서의 상태와 위치를 반환합니다.
    :param indoor_bitmask: 실내 비트마스크 값 (int)
    :param outdoor_bitmask: 실외 비트마스크 값 (int)
    :param sensor_names: 센서 이름 목록 (list)
    :return: 문제 상태를 가진 센서와 그 상태 (list of dict)
    """
    issues = []
    
    for i, sensor in enumerate(sensor_names):
        # 각 센서의 실내 및 실외 비트 위치를 가져옴
        indoor_sensor_bits = (indoor_bitmask >> (i * 2)) & 0b11
        outdoor_sensor_bits = (outdoor_bitmask >> (i * 2)) & 0b11
        
        # 실내 비트마스크 해석
        if indoor_sensor_bits == AnomalyStatus.THRESHOLD_EXCEEDED.value:
            issues.append({"sensor": f"{sensor}_in", "status": "excess"})
        elif indoor_sensor_bits == AnomalyStatus.ANOMALY_DETECTED.value:
            issues.append({"sensor": f"{sensor}_in", "status": "anomaly"})
        
        # 실외 비트마스크 해석
        if outdoor_sensor_bits == AnomalyStatus.THRESHOLD_EXCEEDED.value:
            issues.append({"sensor": f"{sensor}_out", "status": "excess"})
        elif outdoor_sensor_bits == AnomalyStatus.ANOMALY_DETECTED.value:
            issues.append({"sensor": f"{sensor}_out", "status": "anomaly"})
    
    return issues



def generate_bitmask(sensor_values, anomalies, thresholds, in_and_out):
    """
    센서 값을 기준으로 비트마스크를 생성합니다.
    :param sensor_values: 각 센서의 현재 값
    :param anomalies: 재구성 오류 기반 이상치 여부 (True일 경우 이상으로 판단)
    :param thresholds: 각 센서의 임계값
    :return: 센서 상태에 따른 비트마스크
    """
    bitmask = 0b0
    for i, (sensor, value) in enumerate(sensor_values.items()):
        bit_position = i * 2
        if value > thresholds[sensor]:  # 임계치 초과 상태
            bitmask |= 0b01 << bit_position
            print(f"[DEBUG] {sensor}_{in_and_out} value {value} exceeds threshold {thresholds[sensor]} (bitmask set to 0b01)")
        if anomalies[sensor]:  # 재구성 오류로 인한 이상 상태
            bitmask |= 0b11 << bit_position
            print(f"[DEBUG] {sensor}_{in_and_out} anomaly detected, setting bitmask to 0b11")
    return bitmask


def load_config(path="configs/config.yaml"):
    """
    YAML 형식의 설정 파일을 로드합니다.
    :param path: 설정 파일 경로
    :return: 설정 데이터가 담긴 딕셔너리
    """
    with open(path, "r") as file:
        config = yaml.safe_load(file)
    return config



def get_mac_address():
    """
    시스템의 MAC 주소를 가져옵니다.
    :return: MAC 주소 문자열
    """
    mac = uuid.getnode()
    mac_address = ':'.join([f"{(mac >> 8*i) & 0xFF:02x}" for i in reversed(range(6))])
    return mac_address


