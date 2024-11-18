initial = """
conda create -n window python=3.11 -y
conda activate window
pip install pandas numpy scikit-learn
"""

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

# 결측치(NaN) 처리: 첫 번째 행의 NaN 값 제거
df.dropna(inplace=True)

# 비지도 학습 모델 (Isolation Forest) 적용
# 이상치 탐지에 사용할 변화량을 특징으로 지정
features = ["temp_gradient", "humidity_gradient", "air_quality_gradient"]
model = IsolationForest(contamination=0.1, random_state=42)
df["anomaly"] = model.fit_predict(df[features])

# 모델의 예측 결과를 기반으로 문 상태 결정
# -1: 이상치로 판정된 경우 문 열림, 1: 정상으로 문 닫힘
df["door_action"] = df["anomaly"].apply(lambda x: "open" if x == -1 else "close")

# 결과 확인
print(df[["temperature", "humidity", "air_quality", "temp_gradient", "humidity_gradient", "air_quality_gradient", "anomaly", "door_action"]].tail(10))
