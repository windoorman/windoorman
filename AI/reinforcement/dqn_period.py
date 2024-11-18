initial = """
conda create -n window python=3.10 -y
conda activate window
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu118

conda install -c conda-forge cudatoolkit=11.2 cudnn=8.1

pip install tensorflow-gpu==2.10.0
pip install pandas numpy==1.23.5 scikit-learn
pip install shap
pip install tqdm
pip install gym



wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-aarch64.sh
bash Miniforge3-Linux-aarch64.sh

source ~/.bashrc

conda create -n window python=3.10 -y
conda activate window
pip install torch torchvision torchaudio

pip install tensorflow==2.10.0
pip install pandas numpy==1.23.5 scikit-learn shap tqdm gym
pip install PyYAML elasticsearch
"""

import numpy as np
import tensorflow as tf
import random
from datetime import datetime, timedelta
from collections import deque
import math

# 가상의 온도, 습도, 공기질 데이터를 생성하는 함수
def generate_sensor_data():
    temperature = random.uniform(18, 30)  # 예: 18도~30도 사이
    humidity = random.uniform(30, 70)     # 예: 30%~70% 사이
    air_quality = random.uniform(0, 100)  # 예: 0~100 (0이 좋음, 100이 나쁨)

    # 시간 정보 추가
    timestamp = datetime.now()
    hour = timestamp.hour
    day_of_week = timestamp.weekday()
    
    # 계절 정보 추가
    month = timestamp.month
    if month in [3, 4, 5]:
        season = 'spring'
    elif month in [6, 7, 8]:
        season = 'summer'
    elif month in [9, 10, 11]:
        season = 'fall'
    else:
        season = 'winter'
    
    return {
        'temperature': temperature, 
        'humidity': humidity, 
        'air_quality': air_quality, 
        'hour': hour, 
        'day_of_week': day_of_week, 
        'season': season
    }


# 주기 특성 변환 함수
def add_periodic_features(data):
    # 시간대 (하루 24시간 기준)
    data['hour_sin'] = math.sin(2 * math.pi * data['hour'] / 24)
    data['hour_cos'] = math.cos(2 * math.pi * data['hour'] / 24)
    
    # 요일 (주 7일 기준)
    data['day_sin'] = math.sin(2 * math.pi * data['day_of_week'] / 7)
    data['day_cos'] = math.cos(2 * math.pi * data['day_of_week'] / 7)
    
    # 계절 (4계절 기준)
    season_mapping = {'spring': 0, 'summer': 1, 'fall': 2, 'winter': 3}
    season_index = season_mapping[data['season']]
    data['season_sin'] = math.sin(2 * math.pi * season_index / 4)
    data['season_cos'] = math.cos(2 * math.pi * season_index / 4)
    
    # 문자열 특성 삭제
    del data['hour'], data['day_of_week'], data['season']
    
    return data


# 이동 평균 기반 변화율 계산 함수
window_size = 5
air_quality_window = deque(maxlen=window_size)

def calculate_moving_change_rate(new_value):
    # 새 값 추가
    air_quality_window.append(new_value)
    
    # 윈도우가 가득 찼을 때만 변화율 계산
    if len(air_quality_window) == window_size:
        return air_quality_window[-1] - air_quality_window[0]  # 마지막 값과 첫 번째 값 차이
    else:
        return 0  # 윈도우가 가득 차지 않으면 변화율을 0으로 반환


class WindowControlEnv:
    def __init__(self):
        self.state_size = 9  # 온도, 습도, 공기질, 주기 특성 포함
        self.action_size = 2 # 창문 열기(1), 닫기(0)
        self.reset()

    def reset(self):
        # 초기 상태 설정
        sensor_data = generate_sensor_data()
        self.previous_states = deque([sensor_data] * window_size, maxlen=window_size)
        self.state = add_periodic_features(sensor_data)
        return np.array(list(self.state.values()))

    def step(self, action):
        # 새 센서 데이터 가져옴
        sensor_data = generate_sensor_data()
        air_quality_change_rate = calculate_moving_change_rate(sensor_data['air_quality'])
        sensor_data = add_periodic_features(sensor_data)

        # 공기질 급격한 변화 감지 시 창문 열기 보상 추가
        if action == 1 and (sensor_data['air_quality'] < 50 or air_quality_change_rate > 20):
            reward = 1  # 공기질이 좋거나 급격한 악화 시 창문을 여는 보상
        elif action == 0:
            reward = 1  # 창문을 닫는 보상
        else:
            reward = -1  # 잘못된 선택 시 페널티
        
        self.previous_states.append(sensor_data)
        self.state = sensor_data
        done = False
        return np.array(list(self.state.values())), reward, done


class DQNAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95    # discount rate
        self.epsilon = 1.0   # exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        self.model = self._build_model()

    def _build_model(self):
        model = tf.keras.Sequential()
        model.add(tf.keras.layers.Dense(24, input_dim=self.state_size, activation='relu'))
        model.add(tf.keras.layers.Dense(24, activation='relu'))
        model.add(tf.keras.layers.Dense(self.action_size, activation='linear'))
        model.compile(loss='mse', optimizer=tf.keras.optimizers.Adam(learning_rate=self.learning_rate))
        return model

    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        act_values = self.model.predict(state)
        return np.argmax(act_values[0])

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def replay(self, batch_size):
        minibatch = random.sample(self.memory, batch_size)
        for state, action, reward, next_state, done in minibatch:
            target = reward
            if not done:
                target = (reward + self.gamma * np.amax(self.model.predict(next_state)[0]))
            target_f = self.model.predict(state)
            target_f[0][action] = target
            self.model.fit(state, target_f, epochs=1, verbose=0)
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay


# 환경과 에이전트 초기화
env = WindowControlEnv()
agent = DQNAgent(env.state_size, env.action_size)
episodes = 1000  # 학습 에피소드 수

for e in range(episodes):
    print(f"\nStarting Episode {e+1}/{episodes}")
    state = env.reset()
    state = np.reshape(state, [1, env.state_size])
    episode_reward = 0  # 에피소드별 누적 보상

    for time in range(500):
        # 에이전트 행동 선택
        action = agent.act(state)
        print(f"Time Step {time+1}: Action {'Open' if action == 1 else 'Close'} selected.")
        
        # 환경에서 다음 상태와 보상 얻기
        next_state, reward, done = env.step(action)
        next_state = np.reshape(next_state, [1, env.state_size])
        episode_reward += reward
        
        # 에이전트 기억 추가 및 학습
        agent.remember(state, action, reward, next_state, done)
        state = next_state
        
        if done:
            print(f"Episode {e+1} ended after {time+1} time steps with total reward: {episode_reward}")
            break
    
    # 메모리가 충분할 경우 리플레이 학습 진행
    if len(agent.memory) > 32:
        print("Replaying Experience...")
        agent.replay(32)  # 32개 데이터로 학습
    
    # 에피소드 종료 후 진행 상황 출력
    print(f"Episode {e+1} finished. Epsilon: {agent.epsilon:.4f}")
