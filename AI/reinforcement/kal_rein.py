import os
# CUDA 설정: GPU 장치 순서를 PCI 버스 ID 순서로 설정하고, GPU 1번 장치만 사용하도록 지정
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

import gym  # 강화 학습 환경 제작 및 실행을 위한 라이브러리
import numpy as np  # 수치 계산을 위한 라이브러리
import tensorflow as tf  # 신경망 및 딥러닝을 위한 라이브러리
from collections import deque  # 슬라이딩 윈도우 메모리 관리에 사용
import random  # 무작위 샘플링을 위한 라이브러리
from tqdm import tqdm  # 학습 과정 진행 상황을 시각적으로 표시

# DQN 에이전트 정의 클래스 (슬라이딩 윈도우 적용)
class DQNAgent:
    def __init__(self, state_size, action_size, window_size=5):
        # 현재 상태의 변수 개수에 슬라이딩 윈도우 크기를 곱해 총 상태 크기 설정
        self.state_size = state_size * window_size  # 상태 크기 (현재 상태에서 사용할 모든 변수 수)
        self.action_size = action_size  # 가능한 행동의 개수 (여기서는 0: 창문 닫기, 1: 창문 열기)
        self.window_size = window_size  # 몇 개의 상태를 윈도우로 사용할지 설정 (이전 상태 포함 범위)

        # 모델과 타겟 모델을 생성하고 초기화
        self.model = create_model(self.state_size, action_size)  # 에이전트의 정책을 결정하는 메인 모델
        self.target_model = create_model(self.state_size, action_size)  # 메인 모델을 따라가는 타겟 모델
        self.update_target_model()  # 타겟 모델을 메인 모델과 동일하게 초기화

        # 경험 리플레이 메모리 설정 (최대 길이 2000)
        self.memory = deque(maxlen=2000)  # 학습을 위한 이전 경험을 저장하는 큐 (최대 2000개까지 저장)
        
        # DQN 학습 하이퍼파라미터 설정
        self.gamma = 0.95  # 할인율 (미래 보상에 대한 중요도) - 현재 보상보다 미래 보상을 고려할 정도
        self.epsilon = 1.0  # 초기 탐험률 (탐험과 학습 비율) - 처음에는 탐험을 많이 하도록 설정
        self.epsilon_min = 0.01  # 최소 탐험률 - 탐험이 줄어들어도 완전히 사라지지 않도록 설정
        self.epsilon_decay = 0.995  # 에피소드마다 탐험률 감소율 - 점점 학습에 더 집중하도록 감소

    # 타겟 모델을 메인 모델의 가중치로 업데이트하는 메서드
    def update_target_model(self):
        self.target_model.set_weights(self.model.get_weights())

    # 행동 선택 함수 (탐험 또는 예측에 따라 행동 선택)
    def act(self, state):
        # 탐험 여부 결정 (무작위로 행동할 확률)
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)  # 탐험 시 무작위 행동 선택
        # 현재 상태로부터 Q값을 예측하여 가장 큰 Q값을 가진 행동 선택
        q_values = self.model.predict(np.expand_dims(state, axis=0), verbose=0)
        return np.argmax(q_values[0])  # 가장 높은 Q값에 해당하는 행동 반환

    # 경험 리플레이를 통해 모델 학습
    def train(self, batch_size=32):
        # 메모리가 충분하지 않으면 학습하지 않음
        if len(self.memory) < batch_size:
            return
        # 리플레이 메모리에서 무작위로 배치 추출
        minibatch = random.sample(self.memory, batch_size)
        for state, action, reward, next_state in minibatch:
            # 타겟 계산: 보상 + 할인율 * 다음 상태의 최대 Q값
            target = reward + self.gamma * np.amax(self.target_model.predict(np.expand_dims(next_state, axis=0), verbose=0)[0])
            # 현재 상태의 Q값 업데이트
            target_f = self.model.predict(np.expand_dims(state, axis=0), verbose=0)
            target_f[0][action] = target  # 선택한 행동에 대한 Q값을 타겟으로 업데이트
            # 모델 업데이트 (한 번의 에포크만 수행)
            self.model.fit(np.expand_dims(state, axis=0), target_f, epochs=1, verbose=0)

        # 탐험률 감소 (최소 탐험률에 도달할 때까지)
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    # 경험 리플레이 메모리에 상태 전환 정보를 추가
    def remember(self, state, action, reward, next_state):
        # 학습 과정에서 사용할 (상태, 행동, 보상, 다음 상태) 저장
        self.memory.append((state, action, reward, next_state))

    # 모델 저장 메서드
    def save(self, filename):
        self.model.save(filename)  # 학습된 모델 가중치를 파일에 저장

    # 모델 불러오기 메서드
    def load(self, filename):
        self.model = tf.keras.models.load_model(filename)  # 저장된 모델 불러오기
        self.target_model = tf.keras.models.load_model(filename)  # 타겟 모델에도 불러오기

# DQN 모델 생성 함수 (심층 신경망 정의)
def create_model(input_shape, action_space):
    model = tf.keras.models.Sequential()
    model.add(tf.keras.layers.Dense(16, input_dim=input_shape, activation="relu"))  # 첫 번째 은닉층 (16개의 노드)
    model.add(tf.keras.layers.Dense(16, activation="relu"))  # 두 번째 은닉층 (16개의 노드)
    model.add(tf.keras.layers.Dense(action_space, activation="linear"))  # 출력층 (행동별 Q값)
    model.compile(loss="mse", optimizer=tf.keras.optimizers.Adam(learning_rate=0.001))
    return model

# 윈도우 데이터를 준비하는 함수
def prepare_windowed_state(window, new_data):
    # 새로운 데이터를 윈도우에 추가
    window.append(new_data)
    if len(window) < window.maxlen:
        # 데이터가 부족할 경우, 앞쪽에 0으로 패딩하여 윈도우 크기를 맞춤
        padding = np.zeros((window.maxlen - len(window), len(new_data)))
        windowed_state = np.concatenate([padding.flatten(), np.concatenate(window)], axis=0)
    else:
        # 윈도우가 가득 차면 평소대로 데이터 결합
        windowed_state = np.concatenate(window, axis=0)
    return windowed_state

# 강화 학습을 위한 간단한 창문 환경 정의
class SimpleWindowEnv(gym.Env):
    def __init__(self):
        super(SimpleWindowEnv, self).__init__()
        # 상태 공간 정의: 온도, 습도, 공기질, 계절을 포함한 박스 형태
        self.observation_space = gym.spaces.Box(
            low=np.array([-15, 0, 0, 1]),  # 최소값 설정
            high=np.array([45, 100, 300, 4]),  # 최대값 설정 (한국 기후 기준)
            dtype=np.float32
        )
        self.action_space = gym.spaces.Discrete(2)  # 행동 공간: 0(창문 닫기), 1(창문 열기)
        
        self.state = None
        self.reset()

    # 환경 초기화 및 상태 설정
    def reset(self):   
        season = np.random.randint(1, 5)  # 계절 무작위 설정
        # 초기 상태 무작위 설정
        self.state = np.array([np.random.uniform(15, 35),  # 온도
                               np.random.uniform(30, 80),  # 습도
                               np.random.uniform(0, 100),  # 공기질
                               season])  # 계절
        return self.state

    # 행동에 따른 상태 변화 및 보상 계산
    def step(self, action):
        temp, humid, air_quality, season = self.state
        prev_air_quality = air_quality  # 이전 상태의 공기질 저장

        if action == 1:  # 창문을 여는 경우
            air_quality -= np.random.uniform(5, 20)  # 공기질 개선
            # 보상 계산
            if air_quality < 50 and 18 <= temp <= 25:
                reward = 2
            elif air_quality >= 50:
                reward = -2
            else:
                reward = 0
        else:  # 창문을 닫는 경우
            air_quality += np.random.uniform(0, 10)  # 공기질 악화
            # 보상 계산
            if air_quality >= 50:
                reward = 2
            elif 18 <= temp <= 25:
                reward = 1
            else:
                reward = 0

        # 급격한 공기질 변화에 따른 추가 보상/패널티 적용
        air_quality_change = air_quality - prev_air_quality
        if air_quality_change > 10 and action == 1:
            reward += 3
        elif air_quality_change > 10 and action == 0:
            reward -= 3

        # 상태 업데이트
        self.state = np.array([temp, humid, air_quality, season])

        # 에피소드 종료 조건
        done = False
        if air_quality < 30 or air_quality > 250:
            done = True

        return self.state, reward, done, {}

# 훈련 및 추론 코드
if __name__ == "__main__":
    # GPU 사용 가능 여부 확인
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            # 필요한 메모리만 동적으로 할당
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"사용 가능한 GPU 장치: {gpus}")
        except RuntimeError as e:
            print(e)
    else:
        print("GPU가 없습니다. CPU만 사용 중입니다.")

    # 환경 및 에이전트 초기화
    env = SimpleWindowEnv()
    window_size = 5  # 슬라이딩 윈도우 크기
    state_size = env.observation_space.shape[0]  # 상태 공간 크기
    action_size = env.action_space.n  # 행동 공간 크기
    agent = DQNAgent(state_size, action_size, window_size)  # DQN 에이전트 생성

    window = deque(maxlen=window_size)  # 상태 데이터를 저장할 슬라이딩 윈도우

    episodes = 500  # 총 학습 에피소드 수
    batch_size = 32  # 미니배치 크기
    model_filename = "dqn_window_model.h5"  # 모델 저장 파일 이름

    max_steps = 200  # 에피소드당 최대 스텝 수 제한
    train_frequency = 5  # 학습 빈도
    best_total_reward = -float('inf')  # 최고 보상 초기화

    # 학습 에피소드 진행
    for e in tqdm(range(episodes), desc="Training episodes"):
        state = env.reset()
        window.clear()
        window.append(state)
        done = False
        total_reward = 0
        steps = 0

        while not done:
            # 윈도우 상태 준비
            windowed_state = prepare_windowed_state(window, state)
            action = agent.act(windowed_state)  # 행동 선택
            next_state, reward, done, _ = env.step(action)  # 행동 후 상태 및 보상 얻기
            total_reward += reward

            # 윈도우 다음 상태 준비 후 메모리에 저장
            windowed_next_state = prepare_windowed_state(window, next_state)
            agent.remember(windowed_state, action, reward, windowed_next_state)
            state = next_state

            # 주기적으로 에이전트 학습
            if steps % train_frequency == 0:
                agent.train(batch_size)

            steps += 1

            # 스텝 수 제한 도달 시 에피소드 종료
            if steps >= max_steps:
                done = True

        agent.update_target_model()  # 타겟 모델 업데이트
        print(f"Episode {e + 1}/{episodes} completed. Total Reward: {total_reward}, Epsilon: {agent.epsilon:.4f}")

        # 최고 보상을 얻었을 때 모델 저장
        if total_reward > best_total_reward:
            best_total_reward = total_reward
            agent.save(model_filename)
            print(f"New best model saved with Total Reward: {total_reward}")

        # 50 에피소드마다 모델 테스트
        if (e + 1) % 50 == 0:
            agent.load(model_filename)
            print("Model loaded for testing.")

            test_state = np.array([25, 50, 120, 3])  # 테스트 상태
            window.clear()
            window.append(test_state)
            windowed_test_state = prepare_windowed_state(window, test_state)
            action = agent.act(windowed_test_state)
            print(f"Test state: {test_state}, Model action: {'Open window' if action == 1 else 'Close window'}")
