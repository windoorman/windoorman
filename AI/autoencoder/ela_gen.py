import json
import random
import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# 한국의 계절 특성에 맞춘 평균 설정 (온도, 습도, 미세먼지(PM10) 설정)
SEASONAL_VALUES = {
    "winter": {"temp": (-5, 5), "humid": (20, 40), "pm10": (15, 35)},
    "spring": {"temp": (10, 20), "humid": (40, 60), "pm10": (50, 120)},  # 봄철 황사와 미세먼지 증가 반영
    "summer": {"temp": (17, 35), "humid": (70, 90), "pm10": (10, 30)},   # 여름에 최저 기온 17도 반영
    "fall": {"temp": (10, 20), "humid": (40, 60), "pm10": (30, 70)}      # 가을철 미세먼지 증가
}

# 계절 간 점진적인 변화
def gradual_transition(start_value, end_value, transition_factor):
    """두 값 간의 점진적인 변화를 위한 함수 (스무스하게)"""
    return (1 - transition_factor) * start_value + transition_factor * end_value

# 계절별 온도, 습도 변화 함수
def get_seasonal_temp_and_humid(month, is_inside=True, daily_progress=0):
    """실내와 실외 온도를 계절에 맞게 자연스럽게 조정, 계절 간 변화가 스무스하게 이어지도록"""
    # 실내와 실외 온도 설정
    if month in [12, 1, 2]:  # 겨울
        if is_inside:
            temp = random.uniform(18, 22)  # 실내 온도는 18도~22도
        else:
            # 겨울 실외 온도는 -5도~5도 사이에서 변동이 가능하도록 확률적 요소 추가
            base_temp = random.uniform(-5, 5)
            temp_variation = np.sin(daily_progress * 2 * np.pi) * random.uniform(-2, 2)  # 사인 함수로 변동 추가
            temp = base_temp + temp_variation
    elif month in [3, 4, 5]:  # 봄
        if is_inside:
            temp = random.uniform(20, 22)  # 실내 온도는 20도~22도
        else:
            # 봄 실외 온도는 10도~20도 사이에서 확률적 변동
            base_temp = random.uniform(10, 20)
            temp_variation = np.cos(daily_progress * 2 * np.pi) * random.uniform(-3, 3)  # 코사인 함수로 변동 추가
            temp = base_temp + temp_variation
    elif month in [6, 7, 8]:  # 여름
        if is_inside:
            temp = random.uniform(22, 25)  # 실내 온도는 22도~25도
        else:
            # 여름 실외 온도는 17도~35도 사이에서 확률적 변동, 비오는 날씨를 반영하여 온도 감소 추가
            base_temp = random.uniform(17, 35)
            temp_variation = np.sin(daily_progress * 2 * np.pi) * random.uniform(-5, 5)  # 여름이라도 기온이 내려갈 수 있도록
            temp = base_temp + temp_variation
            temp = max(17, min(temp, 35))  # 온도가 범위를 벗어나지 않도록 보정
    elif month in [9, 10, 11]:  # 가을
        if is_inside:
            temp = random.uniform(20, 22)  # 실내 온도는 20도~22도
        else:
            # 가을 실외 온도는 10도~20도 사이에서 확률적 변동
            base_temp = random.uniform(10, 20)
            temp_variation = np.cos(daily_progress * 2 * np.pi) * random.uniform(-3, 3)  # 날씨가 추워질 수 있음
            temp = base_temp + temp_variation

    # 계절 간 점진적인 변화
    humid_range = gradual_transition(40, 60, daily_progress)  # 습도 변화도 점진적으로 변화
    humid = round(humid_range, 1)

    return temp, humid

# 실내와 실외 데이터 생성
def generate_sensor_data(timestamp):
    month = timestamp.month
    hour = timestamp.hour
    daily_progress = hour / 24  # 하루의 시간 진행도 (0:00 ~ 23:59)

    # 계절별 기후 설정
    temp, humid = get_seasonal_temp_and_humid(month, is_inside=True, daily_progress=daily_progress)
    
    # 실내와 실외에 따른 다른 값 설정
    data = []
    for isInside in [1, 0]:  # 실내(1)와 실외(0) 데이터를 각각 생성
        # 실내/실외 온도 설정 (계절에 맞게 부드럽게 변화)
        temp, humid = get_seasonal_temp_and_humid(month, is_inside=isInside, daily_progress=daily_progress)
        
        # CO2와 미세먼지 설정
        co2 = random.randint(350, 600) if isInside == 1 else random.randint(350, 500)
        pm10_range = gradual_transition(15, 35, daily_progress)
        pm10 = round(pm10_range, 1)
        pm25 = round(pm10 * random.uniform(0.4, 0.6), 1)
        tvoc = round(random.uniform(5, 30), 1)  # TVOC는 외부 공기질을 기준으로 설정

        data.append({
            "@timestamp": timestamp,
            "windowsId": 4,  # windowsId는 4로 설정
            "temp": round(temp, 1),
            "humid": humid,
            "pm10": pm10,
            "pm25": pm25,
            "co2": co2,
            "tvoc": tvoc,
            "isInside": isInside
        })
    
    return data

# 1년 동안 매일 2~3시간을 5초 간격으로 데이터 생성
def generate_bulk_data():
    data = []
    for month in range(1, 13):
        for day in range(1, 29):  # 매달 1~28일에 대해 데이터 생성
            hours = sorted(random.sample(range(24), random.randint(2, 3)))  # 매일 2~3시간 선택
            for hour in hours:
                start_time = datetime.datetime(2023, month, day, hour, 0, 0)
                timestamps = pd.date_range(start=start_time, periods=720, freq="5S")  # 5초 간격으로 1시간 생성
                for ts in timestamps:
                    data.extend(generate_sensor_data(ts))  # 실내/실외 데이터를 모두 추가
    return data

# 데이터 생성 및 JSON 파일로 저장
bulk_data = generate_bulk_data()

# 시각화
df = pd.DataFrame(bulk_data)
df["@timestamp"] = pd.to_datetime(df["@timestamp"])

# 6개 센서 데이터 시각화 (6행 1열 레이아웃)
plt.figure(figsize=(15, 18))
plt.subplot(6, 1, 1)
plt.plot(df["@timestamp"], df["temp"], label="Temperature (°C)", color='blue', alpha=0.6)
plt.title("Temperature (°C)")
plt.xlabel("Date")
plt.ylabel("°C")
plt.legend()

plt.subplot(6, 1, 2)
plt.plot(df["@timestamp"], df["humid"], label="Humidity (%)", color='green', alpha=0.6)
plt.title("Humidity (%)")
plt.xlabel("Date")
plt.ylabel("%")
plt.legend()

plt.subplot(6, 1, 3)
plt.plot(df["@timestamp"], df["pm10"], label="PM10 (µg/m³)", color='red', alpha=0.6)
plt.title("PM10 (µg/m³)")
plt.xlabel("Date")
plt.ylabel("µg/m³")
plt.legend()

plt.subplot(6, 1, 4)
plt.plot(df["@timestamp"], df["pm25"], label="PM2.5 (µg/m³)", color='purple', alpha=0.6)
plt.title("PM2.5 (µg/m³)")
plt.xlabel("Date")
plt.ylabel("µg/m³")
plt.legend()

plt.subplot(6, 1, 5)
plt.plot(df["@timestamp"], df["co2"], label="CO2 (ppm)", color='brown', alpha=0.6)
plt.title("CO2 (ppm)")
plt.xlabel("Date")
plt.ylabel("ppm")
plt.legend()

plt.subplot(6, 1, 6)
plt.plot(df["@timestamp"], df["tvoc"], label="TVOC (ppb)", color='orange', alpha=0.6)
plt.title("TVOC (ppb)")
plt.xlabel("Date")
plt.ylabel("ppb")
plt.legend()

plt.tight_layout()
plt.show()

# JSON 저장
with open("seasonal_sensor_data_with_realistic_inside_outside.json", "w") as f:
    json.dump([{
        "@timestamp": row["@timestamp"].isoformat(),
        "windowsId": row["windowsId"],  # windowsId는 4로 설정
        "temp": row["temp"],
        "humid": row["humid"],
        "pm10": row["pm10"],
        "pm25": row["pm25"],
        "co2": row["co2"],
        "tvoc": row["tvoc"],
        "isInside": row["isInside"]
    } for _, row in df.iterrows()], f, indent=2, ensure_ascii=False)

print("실내와 실외 데이터 차이를 리얼리틱하고 스무스하게 반영한 JSON 파일이 'seasonal_sensor_data_with_realistic_inside_outside.json'에 저장되었습니다.")
