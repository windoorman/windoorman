import numpy as np
from collections import deque
import time
import random

class EKFWithDynamicResponse:
    def __init__(self, dim_x, dim_z, threshold, window_size=3, std_factor=1.5, rate_threshold=50, initial_value=500):
        self.dim_x = dim_x
        self.dim_z = dim_z
        self.window_size = window_size
        self.std_factor = std_factor
        self.rate_threshold = rate_threshold
        self.threshold = threshold  # 센서별 임계치 설정
        self.normal_range = (0, 100)  # 기본 정상 범위
        self.x = np.array([[initial_value], [0]], dtype=float)
        self.P = np.eye(dim_x)
        self.Q = np.eye(dim_x) * 1.0  # 상태 변화 가속화를 위해 Q 값을 높임
        self.R = np.eye(dim_z, dtype=float)
        self.measurement_window = deque(maxlen=window_size)
        self.previous_measurement = None
        self.anomaly_bitmask = 0  # 비트마스크 값 초기화

    def update_normal_range(self, predicted_value):
        margin = 0.2  # 정상 범위 마진 (20% 상하 범위)
        lower_bound = max(0, predicted_value - predicted_value * margin)
        upper_bound = predicted_value + predicted_value * margin
        self.normal_range = (round(lower_bound), round(upper_bound))  # 반올림하여 정수형으로 설정

    def calculate_threshold(self):
        if len(self.measurement_window) == self.window_size:
            changes = np.diff(self.measurement_window)
            if changes.size > 0:
                avg_change = np.mean(np.abs(changes))
                std_dev = np.std(changes)
            else:
                avg_change = 0
                std_dev = 0
            self.threshold = avg_change + self.std_factor * std_dev

    def predict(self, f, F_jacobian):
        self.x = f(self.x)  # 상태 벡터 x 업데이트
        self.P = np.dot(F_jacobian(self.x), np.dot(self.P, F_jacobian(self.x).T)) + self.Q
        return self.x[0, 0]  # 예측값 반환

    def update(self, z, h, H_jacobian):
        self.measurement_window.append(z)
        self.calculate_threshold()

        # 측정값이 임계치를 넘으면 1로 표시
        threshold_exceeded = z > self.threshold
        out_of_range = not (self.normal_range[0] <= z <= self.normal_range[1])

        # 비트마스크 구성
        if threshold_exceeded and out_of_range:
            self.anomaly_bitmask = 0b11  # 11: 임계치 초과 및 이상치
        elif threshold_exceeded:
            self.anomaly_bitmask = 0b01  # 01: 임계치 초과
        else:
            self.anomaly_bitmask = 0b00  # 00: 정상 상태

        # 예측 및 업데이트
        y = z - h(self.x)
        S = np.dot(H_jacobian(self.x), np.dot(self.P, H_jacobian(self.x).T)) + self.R
        K = np.dot(self.P, np.dot(H_jacobian(self.x).T, np.linalg.inv(S)))
        self.x += np.dot(K, y)
        self.P = np.dot((np.eye(self.dim_x) - np.dot(K, H_jacobian(self.x))), self.P)

        return self.anomaly_bitmask

# 상태 전이 함수 및 자코비안 정의
def f(x):
    dt = 2
    return np.array([[x[0, 0] + dt * x[1, 0]], [x[1, 0]]])

def F_jacobian(x):
    dt = 2
    return np.array([[1, dt], [0, 1]])

def h(x):
    return np.array([[x[0, 0]]])

def H_jacobian(x):
    return np.array([[1, 0]])

# 실시간 데이터 생성 함수
def generate_real_time_data():
    return {
        "indoor": {
            "eco2": random.randint(400, 2500),
            "voc": random.randint(150, 1500),
            "pm10": random.randint(50, 200),
            "pm2.5": random.randint(25, 150)
        },
        "outdoor": {
            "eco2": random.randint(300, 800),
            "voc": random.randint(100, 500),
            "pm10": random.randint(20, 100),
            "pm2.5": random.randint(10, 50)
        }
    }

# 창문 상태 및 상태 유지 비트마스크
window_open = False
hold_mask_indoor = 0b0
hold_mask_outdoor = 0b0

def determine_window_action(indoor_anomaly_mask, outdoor_anomaly_mask):
    global window_open, hold_mask_indoor, hold_mask_outdoor

    if window_open:
        for i in range(4):
            indoor_bits = (indoor_anomaly_mask >> (i * 2)) & 0b11
            outdoor_bits = (outdoor_anomaly_mask >> (i * 2)) & 0b11

            if indoor_bits == 0b11:
                hold_mask_indoor |= (0b11 << (i * 2))
                hold_mask_outdoor &= ~(0b11 << (i * 2))
            elif indoor_bits == 0b01:
                hold_mask_indoor |= (0b01 << (i * 2))
                hold_mask_outdoor &= ~(0b11 << (i * 2))
            elif outdoor_bits == 0b11 and hold_mask_indoor == 0:
                hold_mask_outdoor |= (0b11 << (i * 2))
            elif outdoor_bits == 0b01 and hold_mask_indoor == 0:
                hold_mask_outdoor |= (0b01 << (i * 2))

        if hold_mask_indoor == 0 and hold_mask_outdoor == 0:
            window_open = False
            return "창문 닫음 (공기질 양호)"
        else:
            return "창문 열림 유지 (실내 오염 우선 처리 중)"
    
    else:
        for i in range(4):
            indoor_bits = (indoor_anomaly_mask >> (i * 2)) & 0b11
            outdoor_bits = (outdoor_anomaly_mask >> (i * 2)) & 0b11

            if indoor_bits == 0b11:
                window_open = True
                hold_mask_indoor = indoor_anomaly_mask
                hold_mask_outdoor = 0b0
                return "창문 열림 (실내 급격 오염)"
            elif indoor_bits == 0 and outdoor_bits == 0b11:
                window_open = False
                hold_mask_outdoor = outdoor_anomaly_mask
                hold_mask_indoor = 0b0
                return "창문 닫음 유지 (실외도 나쁨)"

        if hold_mask_indoor:
            window_open = True
            return "창문 열림 (실내 문제 유지)"
        elif hold_mask_outdoor:
            window_open = False
            return "창문 닫음 유지 (실외 문제 유지)"
        else:
            return "창문 닫음 (실내 공기질 양호)"

def main():
    indoor_sensors = {
        "eco2": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=1000, window_size=3, std_factor=1.4, rate_threshold=300, initial_value=1000),
        "voc": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=400, window_size=3, std_factor=1.8, rate_threshold=200, initial_value=300),
        "pm10": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=100, window_size=3, std_factor=1.2, rate_threshold=30, initial_value=70),
        "pm2.5": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=50, window_size=3, std_factor=1.5, rate_threshold=25, initial_value=35),
    }
    outdoor_sensors = {
        "eco2": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=600, window_size=3, std_factor=1.4, rate_threshold=300, initial_value=500),
        "voc": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=200, window_size=3, std_factor=1.8, rate_threshold=200, initial_value=150),
        "pm10": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=50, window_size=3, std_factor=1.2, rate_threshold=30, initial_value=30),
        "pm2.5": EKFWithDynamicResponse(dim_x=2, dim_z=1, threshold=25, window_size=3, std_factor=1.5, rate_threshold=25, initial_value=15),
    }

    sensor_types = list(indoor_sensors.keys())

    for t in range(10):
        data = generate_real_time_data()
        print(f"\n시점 {t+1}:")

        indoor_anomaly_mask = 0
        outdoor_anomaly_mask = 0

        print("  실내 센서 데이터:")
        for i, sensor_type in enumerate(sensor_types):
            indoor_sensor = indoor_sensors[sensor_type]
            measurement = data["indoor"][sensor_type]
            
            predicted_value = indoor_sensor.predict(f, F_jacobian)
            indoor_sensor.update_normal_range(predicted_value)
            normal_range = indoor_sensor.normal_range
            
            bitmask = indoor_sensor.update(np.array([[measurement]]), h, H_jacobian)
            indoor_anomaly_mask |= (bitmask << (i * 2))

            print(f"    {sensor_type} - 측정값: {measurement}, 예측값: {predicted_value:.2f}, 정상 범주: {normal_range}, 비트마스크: {bin(bitmask)}")

        print("  실외 센서 데이터:")
        for i, sensor_type in enumerate(sensor_types):
            outdoor_sensor = outdoor_sensors[sensor_type]
            measurement = data["outdoor"][sensor_type]
            
            predicted_value = outdoor_sensor.predict(f, F_jacobian)
            outdoor_sensor.update_normal_range(predicted_value)
            normal_range = outdoor_sensor.normal_range
            
            bitmask = outdoor_sensor.update(np.array([[measurement]]), h, H_jacobian)
            outdoor_anomaly_mask |= (bitmask << (i * 2))

            print(f"    {sensor_type} - 측정값: {measurement}, 예측값: {predicted_value:.2f}, 정상 범주: {normal_range}, 비트마스크: {bin(bitmask)}")

        window_action = determine_window_action(indoor_anomaly_mask, outdoor_anomaly_mask)
        print(f"  실내 비트마스크: {bin(indoor_anomaly_mask)}, 실외 비트마스크: {bin(outdoor_anomaly_mask)}")
        print(f"  창문 상태: {window_action}")
        print(f"  상태 유지 비트마스크 (실내: {bin(hold_mask_indoor)}, 실외: {bin(hold_mask_outdoor)})")

        time.sleep(5)

if __name__ == "__main__":
    main()