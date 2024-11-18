import gym
import numpy as np
import tensorflow as tf
from collections import deque
import random
from tqdm import tqdm  # tqdm 라이브러리로 진행 상황 바 추가

# DQN 에이전트 정의 (슬라이딩 윈도우 적용)
class DQNAgent:
    def __init__(self, state_size, action_size, window_size=5):
        self.state_size = state_size * window_size  # 윈도우 크기를 고려한 상태 크기
        self.action_size = action_size
        self.window_size = window_size  # 윈도우 크기 (몇 개의 시점 데이터를 묶을지)
        self.model = create_model(self.state_size, action_size)
        self.target_model = create_model(self.state_size, action_size)
        self.update_target_model()

        self.memory = deque(maxlen=2000)
        self.gamma = 0.95  # 할인율
        self.epsilon = 1.0  # 탐험율
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995

    def update_target_model(self):
        self.target_model.set_weights(self.model.get_weights())

    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        q_values = self.model.predict(np.expand_dims(state, axis=0), verbose=0)
        return np.argmax(q_values[0])

    def train(self, batch_size=32):
        if len(self.memory) < batch_size:
            return
        minibatch = random.sample(self.memory, batch_size)
        for state, action, reward, next_state in minibatch:
            target = reward
            target = reward + self.gamma * np.amax(self.target_model.predict(np.expand_dims(next_state, axis=0), verbose=0)[0])
            target_f = self.model.predict(np.expand_dims(state, axis=0), verbose=0)
            target_f[0][action] = target
            self.model.fit(np.expand_dims(state, axis=0), target_f, epochs=1, verbose=0)

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def remember(self, state, action, reward, next_state):
        self.memory.append((state, action, reward, next_state))

    # 모델 저장 메서드
    def save(self, filename):
        self.model.save(filename)

    # 모델 불러오기 메서드
    def load(self, filename):
        self.model = tf.keras.models.load_model(filename)
        self.target_model = tf.keras.models.load_model(filename)

# DQN 모델 정의
def create_model(input_shape, action_space):
    model = tf.keras.models.Sequential()
    model.add(tf.keras.layers.Dense(16, input_dim=input_shape, activation="relu"))  # 노드 수 줄이기
    model.add(tf.keras.layers.Dense(16, activation="relu"))
    model.add(tf.keras.layers.Dense(action_space, activation="linear"))
    model.compile(loss="mse", optimizer=tf.keras.optimizers.Adam(learning_rate=0.001))
    return model

# 윈도우 구간을 위한 데이터 준비 함수
def prepare_windowed_state(window, new_data):
    window.append(new_data)
    if len(window) < window.maxlen:
        padding = np.zeros((window.maxlen - len(window), len(new_data)))
        windowed_state = np.concatenate([padding.flatten(), np.concatenate(window)], axis=0)
    else:
        windowed_state = np.concatenate(window, axis=0)
    return windowed_state

# 창문 환경 정의
class SimpleWindowEnv(gym.Env):
    def __init__(self):
        super(SimpleWindowEnv, self).__init__()
        # 상태: [온도, 습도, 공기질, 계절]
        self.observation_space = gym.spaces.Box(
            low=np.array([-15, 10, 0, 1]),  # [온도, 습도, 공기질, 계절]
            high=np.array([35, 100, 300, 4]),  # 한국 기후에 맞는 범위
            dtype=np.float32
        )
        self.action_space = gym.spaces.Discrete(2)  # 0: 창문 닫기, 1: 창문 열기
        
        self.state = None
        self.reset()

    def reset(self):
        season = np.random.randint(1, 5)
        self.state = np.array([np.random.uniform(15, 35),  # 온도
                               np.random.uniform(30, 80),  # 습도
                               np.random.uniform(50, 200),  # 공기질
                               season])  # 계절
        return self.state

    def step(self, action):
        temp, humid, air_quality, season = self.state
        prev_air_quality = air_quality  # 이전 상태의 공기질 저장

        if action == 1:  # 창문을 여는 경우
            air_quality -= np.random.uniform(5, 20)  # 공기질 개선
            if air_quality < 50 and 18 <= temp <= 25:
                reward = 2
            elif air_quality >= 50:
                reward = -2
            else:
                reward = 0
        else:  # 창문을 닫는 경우
            air_quality += np.random.uniform(0, 10)  # 공기질 악화
            if air_quality >= 50:
                reward = 2
            elif 18 <= temp <= 25:
                reward = 1
            else:
                reward = 0

        air_quality_change = air_quality - prev_air_quality
        if air_quality_change > 10 and action == 1:
            reward += 3
        elif air_quality_change > 10 and action == 0:
            reward -= 3

        self.state = np.array([temp, humid, air_quality, season])
        done = False
        return self.state, reward, done, {}

# 훈련 및 추론 과정
if __name__ == "__main__":
    # GPU 사용 가능 여부 확인
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            # 모든 GPU 메모리의 제한을 설정하지 않고 동적으로 필요한 메모리만 할당
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"사용 가능한 GPU 장치: {gpus}")
        except RuntimeError as e:
            print(e)
    else:
        print("GPU가 없습니다. CPU만 사용 중입니다.")

    env = SimpleWindowEnv()
    window_size = 5  # 슬라이딩 윈도우 크기
    state_size = env.observation_space.shape[0]
    action_size = env.action_space.n
    agent = DQNAgent(state_size, action_size, window_size)

    window = deque(maxlen=window_size)

    episodes = 500
    batch_size = 32
    model_filename = "dqn_window_model.h5"

    train_frequency = 5

for e in tqdm(range(episodes), desc="Training episodes"):
    state = env.reset()
    window.clear()
    window.append(state)
    done = False
    total_reward = 0
    steps = 0

    while not done:
        windowed_state = prepare_windowed_state(window, state)
        action = agent.act(windowed_state)
        next_state, reward, done, _ = env.step(action)
        total_reward += reward

        windowed_next_state = prepare_windowed_state(window, next_state)
        agent.remember(windowed_state, action, reward, windowed_next_state)
        state = next_state

        # 매 train_frequency 스텝마다 훈련
        if steps % train_frequency == 0:
            agent.train(batch_size)
        
        steps += 1

    agent.update_target_model()
    print(f"Episode {e + 1}/{episodes} completed. Total Reward: {total_reward}")

    # 모델 저장
    agent.save(model_filename)
    print(f"Model saved as {model_filename}")

    # 모델 불러오기 및 테스트
    agent.load(model_filename)
    print("Model loaded for testing.")

    test_state = np.array([25, 50, 120, 2])  # 테스트 상태
    window.clear()
    window.append(test_state)
    windowed_test_state = prepare_windowed_state(window, test_state)
    action = agent.act(windowed_test_state)
    print(f"Test state: {test_state}, Model action: {'Open window' if action == 1 else 'Close window'}")
