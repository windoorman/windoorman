import numpy as np
import tensorflow as tf
from collections import deque
import random
import time

# Autoencoder 모델 생성
input_dim = 4  # eco2, voc, pm10, pm2.5
encoding_dim = 2  # 압축 차원

input_layer = tf.keras.layers.Input(shape=(input_dim,))
encoder = tf.keras.layers.Dense(encoding_dim, activation="relu")(input_layer)
decoder = tf.keras.layers.Dense(input_dim, activation="linear")(encoder)
autoencoder = tf.keras.models.Model(inputs=input_layer, outputs=decoder)
autoencoder.compile(optimizer="adam", loss="mse")

# 정상 데이터로 학습 (실제로는 충분한 정상 데이터를 학습에 사용)
normal_data = np.array([[400, 150, 50, 25], [450, 180, 55, 28], [420, 170, 53, 26]])
autoencoder.fit(normal_data, normal_data, epochs=50, batch_size=4, shuffle=True)

# 상태 유지 비트마스크 및 창문 상태
window_open = False
hold_mask_indoor = 0b0
hold_mask_outdoor = 0b0

# 임계치 및 설정값 정의
reconstruction_threshold = 0.05  # 재구성 오류 임계치
sensor_thresholds = {"eco2": 1000, "voc": 300, "pm10": 75, "pm2.5": 35}

# 이상 감지 함수 (재구성 오류 기반)
def detect_anomaly(data):
    reconstructed_data = autoencoder.predict(data)
    reconstruction_error = np.abs(data - reconstructed_data)
    threshold_exceeded = reconstruction_error > reconstruction_threshold
    return threshold_exceeded.flatten()  # 각 센서별 오류 여부를 1차원 배열로 반환

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

# 비트마스크 생성 함수
def generate_bitmask(sensor_values, is_anomaly, thresholds):
    bitmask = 0b0
    for i, (sensor, value) in enumerate(sensor_values.items()):
        bit_position = i * 2
        if value > thresholds[sensor]:  # 임계치 초과
            bitmask |= 0b01 << bit_position
        if is_anomaly[i]:  # 재구성 오류로 이상 감지
            bitmask |= 0b11 << bit_position
    return bitmask

# 창문 상태 결정 함수
def determine_window_action(indoor_anomaly_mask, outdoor_anomaly_mask):
    global window_open, hold_mask_indoor, hold_mask_outdoor

    # 창문 열림 유지 로직
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

    # 창문 닫혀 있는 경우
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

# 주 실행 함수
def main():
    sensor_types = list(sensor_thresholds.keys())

    for t in range(10):
        data = generate_real_time_data()
        print(f"\n시점 {t+1}:")

        indoor_data = np.array([[data["indoor"][sensor] for sensor in sensor_types]])
        outdoor_data = np.array([[data["outdoor"][sensor] for sensor in sensor_types]])

        indoor_anomalies = detect_anomaly(indoor_data)
        outdoor_anomalies = detect_anomaly(outdoor_data)

        indoor_anomaly_mask = generate_bitmask(data["indoor"], indoor_anomalies, sensor_thresholds)
        outdoor_anomaly_mask = generate_bitmask(data["outdoor"], outdoor_anomalies, sensor_thresholds)

        # 비트마스크 결과와 창문 상태 출력
        print("  실내 비트마스크:", bin(indoor_anomaly_mask))
        print("  실외 비트마스크:", bin(outdoor_anomaly_mask))

        window_action = determine_window_action(indoor_anomaly_mask, outdoor_anomaly_mask)
        print(f"  창문 상태: {window_action}")
        print(f"  상태 유지 비트마스크 (실내: {bin(hold_mask_indoor)}, 실외: {bin(hold_mask_outdoor)})")

        time.sleep(5)

if __name__ == "__main__":
    main()
