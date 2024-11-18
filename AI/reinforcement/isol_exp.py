import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

# 예시 데이터 생성 (온도, 습도, 공기질 센서의 시계열 데이터)
data = {
    "timestamp": pd.date_range(start="2024-01-01", periods=100, freq="min"),  # 1분 간격 데이터
    "temperature": np.random.normal(25, 1, 100).cumsum(),
    "humidity": np.random.normal(50, 0.5, 100).cumsum(),
    "air_quality": np.random.normal(100, 2, 100).cumsum()
}
df = pd.DataFrame(data)
df.set_index("timestamp", inplace=True)

# 각 센서의 변화량(기울기) 계산
df["temp_gradient"] = df["temperature"].diff()
df["humidity_gradient"] = df["humidity"].diff()
df["air_quality_gradient"] = df["air_quality"].diff()

# 결측치(NaN) 처리
df.dropna(inplace=True)

# IsolationForest 모델을 각 센서별 변화량에 적용하여 이상치 탐지
# 개별 센서의 이상치는 각각 temp_anomaly, humidity_anomaly, air_quality_anomaly 열에 저장
for feature, anomaly_column in zip(
    ["temp_gradient", "humidity_gradient", "air_quality_gradient"],
    ["temp_anomaly", "humidity_anomaly", "air_quality_anomaly"]
):
    model = IsolationForest(contamination=0.1, random_state=42)
    df[anomaly_column] = model.fit_predict(df[[feature]])

# 전체 이상치 컬럼 추가: 모든 센서에서 이상치인 경우 문을 여는 방식
df["door_action"] = df.apply(
    lambda row: "open" if -1 in [row["temp_anomaly"], row["humidity_anomaly"], row["air_quality_anomaly"]] else "close",
    axis=1
)

# 결과 확인
print(df[["temperature", "humidity", "air_quality", "temp_anomaly", "humidity_anomaly", "air_quality_anomaly", "door_action"]].tail(20))