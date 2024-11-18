initial = """
conda create -n window python=3.11 -y
conda activate window
pip install pandas numpy scikit-learn
pip install tensorflow
pip install shap
"""

import numpy as np
import tensorflow as tf
import shap
import random
from datetime import datetime
from collections import deque
import math

def generate_sensor_data():
    temperature = random.uniform(18, 30)  # 18~30도
    humidity = random.uniform(30, 70)     # 30%~70%
    air_quality = random.uniform(0, 100)  # 0~100

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

def add_periodic_features(data):
    data['hour_sin'] = math.sin(2 * math.pi * data['hour'] / 24)
    data['hour_cos'] = math.cos(2 * math.pi * data['hour'] / 24)
    
    data['day_sin'] = math.sin(2 * math.pi * data['day_of_week'] / 7)
    data['day_cos'] = math.cos(2 * math.pi * data['day_of_week'] / 7)
    
    season_mapping = {'spring': 0, 'summer': 1, 'fall': 2, 'winter': 3}
    season_index = season_mapping[data['season']]
    data['season_sin'] = math.sin(2 * math.pi * season_index / 4)
    data['season_cos'] = math.cos(2 * math.pi * season_index / 4)
    
    del data['hour'], data['day_of_week'], data['season']
    return data

class WindowControlEnv:
    def __init__(self):
        self.state_size = 12
        self.action_size = 2
        self.reset()

    def reset(self):
        sensor_data = generate_sensor_data()
        self.previous_states = deque([sensor_data] * 5, maxlen=5)
        self.state = add_periodic_features(sensor_data)
        return np.array(list(self.state.values()))

    def step(self, action):
        sensor_data = generate_sensor_data()
        air_quality_change_rate = self.calculate_moving_change_rate(sensor_data['air_quality'])
        sensor_data = add_periodic_features(sensor_data)

        if action == 1 and (sensor_data['air_quality'] < 50 or air_quality_change_rate > 20):
            reward = 1
        elif action == 0:
            reward = 1
        else:
            reward = -1
        
        self.previous_states.append(sensor_data)
        self.state = sensor_data
        done = False
        return np.array(list(self.state.values())), reward, done
    
    def calculate_moving_change_rate(self, new_value):
        self.previous_states.append(new_value)
        if len(self.previous_states) == 5:
            return self.previous_states[-1] - self.previous_states[0]
        else:
            return 0
        

class DQNAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95
        self.epsilon = 1.0
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


# SHAP 분석 함수
def explain_action(agent, state):
    explainer = shap.KernelExplainer(agent.model.predict, np.array([state]))
    shap_values = explainer.shap_values(np.array([state]))
    shap.summary_plot(shap_values, feature_names=[
        'temperature', 'humidity', 'air_quality', 'hour_sin', 'hour_cos', 
        'day_sin', 'day_cos', 'season_sin', 'season_cos'
    ], plot_type="bar")

env = WindowControlEnv()
agent = DQNAgent(env.state_size, env.action_size)
episodes = 100

for e in range(episodes):
    state = env.reset()
    state = np.reshape(state, [1, env.state_size])
    for time in range(200):
        action = agent.act(state)
        next_state, reward, done = env.step(action)
        next_state = np.reshape(next_state, [1, env.state_size])
        agent.remember(state, action, reward, next_state, done)
        state = next_state
        if done:
            break
    if len(agent.memory) > 32:
        agent.replay(32)

    # 특정 에피소드마다 주요 요인 분석
    if (e+1) % 10 == 0:
        print(f"Episode {e+1} - 주요 요인 분석")
        explain_action(agent, state[0])
