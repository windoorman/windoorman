import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import heapq
from data_simulator import generate_korean_data  # 데이터 시뮬레이터
import os
import torch.nn.utils  # Gradient clipping에 필요
from torch.optim.lr_scheduler import StepLR  # 학습률 스케줄러
import matplotlib.pyplot as plt

current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, "..", "models")
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

# 모델 저장
MODEL_SAVE_PATH = os.path.join(models_dir, "best_dqn_model.pth")


# 센서 임계치 설정
sensor_thresholds = {
    "temperature": 30,
    "humidity": 70,
    "pm10": 100,
    "pm25": 50,
    "voc": 200,
    "eco2": 1000
}
sensor_names = list(sensor_thresholds.keys())

# LSTM을 포함한 DQN 모델 정의
class LSTMDQNF32(nn.Module):
    def __init__(self, state_dim, action_dim):
        super(LSTMDQNF32, self).__init__()
        self.lstm = nn.LSTM(state_dim, 24, batch_first=True)
        self.fc = nn.Linear(24, action_dim)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        q_values = self.fc(lstm_out[:, -1, :])  # 마지막 LSTM 출력을 사용
        return q_values

# 우선순위 경험 재생 메모리
class PrioritizedReplayBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.buffer = []
        self.priority_queue = []
        self.position = 0
        self.alpha = 0.6  # 우선순위 중요도 가중치

    def push(self, error, transition):
        priority = (error + 1e-5) ** self.alpha
        if len(self.buffer) < self.capacity:
            self.buffer.append(transition)
            heapq.heappush(self.priority_queue, (-priority, self.position))
        else:
            self.buffer[self.position] = transition
            heapq.heappushpop(self.priority_queue, (-priority, self.position))
        self.position = (self.position + 1) % self.capacity

    def sample(self, batch_size):
        indices = [heapq.heappop(self.priority_queue)[1] for _ in range(batch_size)]
        samples = [self.buffer[idx] for idx in indices]
        return samples, indices

    def update_priorities(self, indices, errors):
        for idx, error in zip(indices, errors):
            priority = (error + 1e-5) ** self.alpha
            heapq.heappush(self.priority_queue, (-priority, idx))

# EKF 클래스에 비트마스킹 기능 적용
class EKFF32:
    def __init__(self, state_dim, process_noise, measurement_noise):
        self.state = np.zeros(state_dim, dtype=np.float32)
        self.prev_state = np.zeros(state_dim, dtype=np.float32)
        self.P = np.eye(state_dim, dtype=np.float32) * 1000
        self.Q = np.eye(state_dim, dtype=np.float32) * process_noise
        self.R = np.eye(state_dim, dtype=np.float32) * measurement_noise
        self.current_decision = "창문 닫힘"
        self.indoor_bitmask = [0b00] * state_dim
        self.outdoor_bitmask = [0b00] * state_dim

    def predict(self, F):
        # EKF 예측 단계
        self.prev_state = self.state.copy()
        self.state = np.matmul(F, self.state)
        self.P = np.matmul(np.matmul(F, self.P), F.T) + self.Q
        return self.state

    def update(self, indoor_measurement, outdoor_measurement, H):
        # EKF 업데이트 단계
        K = np.matmul(self.P, np.matmul(H.T, np.linalg.inv(np.matmul(H, np.matmul(self.P, H.T)) + self.R)))
        self.state += np.matmul(K, (indoor_measurement - np.matmul(H, self.state)))
        self.P = (np.eye(len(self.P), dtype=np.float32) - np.matmul(K, H)) @ self.P

        # 각 센서의 비트 상태 업데이트
        for i in range(len(sensor_names)):
            self.indoor_bitmask[i] = self.update_bitmask(self.indoor_bitmask[i], indoor_measurement[i], sensor_thresholds[sensor_names[i]], "indoor", i)
            self.outdoor_bitmask[i] = self.update_bitmask(self.outdoor_bitmask[i], outdoor_measurement[i], sensor_thresholds[sensor_names[i]], "outdoor", i)

        decision = self.apply_priority_logic()
        prediction_error = np.abs(indoor_measurement - self.state).sum()  # 예측 오차 계산

        return decision, self.indoor_bitmask, self.outdoor_bitmask, prediction_error

    def update_bitmask(self, current_bitmask, measurement, threshold, location, sensor_index):
        # 센서 측정값에 따른 비트 상태 결정
        if measurement >= threshold:  # 임계치를 초과한 경우
            new_bitmask = 0b11 if measurement > threshold * 1.5 else 0b01  # 급격한 변화는 0b11, 천천한 초과는 0b01
        else:
            new_bitmask = current_bitmask  # 임계치 미만으로 떨어지기 전까지 상태 유지

        # 내부와 외부 간 비트 우선순위 조정
        if location == "indoor":
            if self.outdoor_bitmask[sensor_index] == 0b01 and new_bitmask == 0b11:
                self.outdoor_bitmask[sensor_index] = 0b00  # 외부 0b01 무시하고 내부 0b11 설정
        elif location == "outdoor":
            if self.indoor_bitmask[sensor_index] == 0b11:
                return current_bitmask  # 내부에 0b11이 있는 경우 외부의 상태는 무시

        return new_bitmask

    def apply_priority_logic(self):
        # 내부/외부 비트 상태에 따라 창문 상태 결정
        for i in range(len(sensor_names)):
            if self.indoor_bitmask[i] == 0b11:
                return "창문 열림 (급격한 실내 오염)"
            elif self.outdoor_bitmask[i] == 0b11 and self.indoor_bitmask[i] == 0b00:
                return "창문 닫힘 (급격한 실외 오염)"
        return "창문 닫힘"  # 기본적으로 닫힘 유지

# 강화 학습 환경 정의
class WindowControlEnvRL:
    def __init__(self, threshold, hold_threshold):
        self.state = np.zeros(6)
        self.threshold = threshold
        self.window_open = False
        self.hold_threshold = hold_threshold

    def reset(self, use_simulation=False):
        if use_simulation:
            self.state = generate_korean_data(1)[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]].values[0]
        else:
            self.state = np.random.rand(6) * 100
        return self.state

    def step(self, action, ekf_error):
        reward = 0
        done = False
        self.state = np.random.rand(6) * 100

        ekf_penalty = ekf_error * 0.1

        # 급격한 악화 시 창문을 여는 경우 보상
        if action == 1:
            reward = 1 - ekf_penalty
            self.window_open = True
        # 창문을 닫는 경우 보상
        elif action == 0:
            reward = 1 - ekf_penalty
            self.window_open = False
        # 잘못된 선택을 한 경우 패널티 부여
        else:
            reward = -1 - ekf_penalty

        return self.state, reward, done

# 모델 저장 함수
def save_model(model, path):
    torch.save(model.state_dict(), path)

# 모델 로드 함수
def load_model(model, path):
    if os.path.exists(path):
        model.load_state_dict(torch.load(path))
        print(f"Model loaded from {path}")
    else:
        print(f"No saved model found at {path}")

# 모델 학습 함수 (save_model 호출 시 로그 없음)
def train_dqn_rl(env, ekf, episodes=100, gamma=0.99, epsilon=0.5, epsilon_min=0.05, epsilon_decay=0.995, lr=0.00005, sim_start_episode=50, improvement_threshold=0.01, max_steps=200):
    dqn = LSTMDQNF32(state_dim=6, action_dim=2)
    optimizer = optim.Adam(dqn.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = StepLR(optimizer, step_size=20, gamma=0.9)
    criterion = nn.MSELoss()
    memory = PrioritizedReplayBuffer(capacity=10000)
    best_loss = float("inf")

    for episode in range(episodes):
        use_simulation = episode >= sim_start_episode
        state = env.reset(use_simulation=use_simulation)
        state_seq = deque([state], maxlen=5)
        done = False
        total_loss = 0
        total_reward = 0
        steps = 0

        while not done and steps < max_steps:
            if len(state_seq) < 5:
                state_seq_filled = [np.zeros_like(state)] * (5 - len(state_seq)) + list(state_seq)
            else:
                state_seq_filled = list(state_seq)

            state_tensor = torch.FloatTensor(np.array(state_seq_filled)).unsqueeze(0)

            if random.random() < epsilon:
                action = random.choice([0, 1])
            else:
                q_values = dqn(state_tensor)
                action = torch.argmax(q_values).item()

            ekf_state = ekf.predict(F=np.eye(6))
            _, indoor_bitmask, outdoor_bitmask, ekf_error = ekf.update(state, state, H=np.eye(6))

            next_state, reward, done = env.step(action, ekf_error)
            reward = max(-1, min(1, reward))
            next_state_seq = state_seq.copy()
            next_state_seq.append(next_state)

            if len(next_state_seq) < 5:
                next_state_seq_filled = [np.zeros_like(state)] * (5 - len(next_state_seq)) + list(next_state_seq)
            else:
                next_state_seq_filled = list(next_state_seq)

            state_tensor = torch.FloatTensor(np.array(state_seq_filled)).unsqueeze(0)
            next_state_tensor = torch.FloatTensor(np.array(next_state_seq_filled)).unsqueeze(0)
            target = reward + gamma * torch.max(dqn(next_state_tensor)).item()
            error = abs(target - torch.max(dqn(state_tensor)).item())
            memory.push(error, (state_seq_filled, action, reward, next_state_seq_filled))

            state_seq.append(next_state)
            total_reward += reward
            steps += 1

            if len(memory.buffer) > 32:
                batch, indices = memory.sample(32)
                batch_states, batch_actions, batch_rewards, batch_next_states = zip(*batch)

                batch_states_tensor = torch.FloatTensor(np.array(batch_states))
                batch_next_states_tensor = torch.FloatTensor(np.array(batch_next_states))
                batch_actions_tensor = torch.LongTensor(batch_actions).view(-1, 1)
                batch_rewards_tensor = torch.FloatTensor(batch_rewards)

                q_values = dqn(batch_states_tensor).gather(1, batch_actions_tensor).squeeze(1)
                next_q_values = dqn(batch_next_states_tensor).max(1)[0]
                target = batch_rewards_tensor + gamma * next_q_values
                loss = criterion(q_values, target.detach())
                
                total_loss += loss.item()

                optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(dqn.parameters(), max_norm=1.0)
                optimizer.step()

                errors = abs(target - q_values).detach().numpy()
                memory.update_priorities(indices, errors)

                if loss.item() < best_loss * (1 - improvement_threshold):
                    best_loss = loss.item()
                    if episode % 10 == 0:
                        save_model(dqn, MODEL_SAVE_PATH)

        if epsilon > epsilon_min:
            epsilon *= epsilon_decay

        scheduler.step()

        avg_loss = total_loss / steps if steps > 0 else 0
        avg_reward = total_reward / steps if steps > 0 else 0
        print(f"Episode {episode + 1}/{episodes} | Steps: {steps} | Avg Loss: {avg_loss:.4f} | Avg Reward: {avg_reward:.4f} | Epsilon: {epsilon:.2f}")

    return dqn


if __name__ == "__main__":
    ekf = EKFF32(state_dim=6, process_noise=0.1, measurement_noise=0.1)
    env = WindowControlEnvRL(threshold=50, hold_threshold=5)

    trained_dqn = train_dqn_rl(env, ekf, episodes=100)

    loaded_dqn = LSTMDQNF32(state_dim=6, action_dim=2)
    load_model(loaded_dqn, MODEL_SAVE_PATH)
    
