# improved_autoencoder_training.py - 데이터 정규화 추가 및 개선된 학습 코드
import torch
import torch.nn as nn
from data_simulator import generate_korean_data
import os
import numpy as np

def standardize_data_by_sensor(data):
    """센서별로 개별 표준화 진행"""
    standardized_data = data.copy()
    standardized_data["temperature"] = (data["temperature"] - data["temperature"].mean()) / data["temperature"].std()
    standardized_data["humidity"] = (data["humidity"] - data["humidity"].mean()) / data["humidity"].std()
    standardized_data["pm10"] = (data["pm10"] - data["pm10"].mean()) / data["pm10"].std()
    standardized_data["pm25"] = (data["pm25"] - data["pm25"].mean()) / data["pm25"].std()
    standardized_data["voc"] = (data["voc"] - data["voc"].mean()) / data["voc"].std()
    standardized_data["eco2"] = (data["eco2"] - data["eco2"].mean()) / data["eco2"].std()
    return standardized_data


class ImprovedAutoencoder(nn.Module):
    def __init__(self, input_dim=6):
        super(ImprovedAutoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 4),
            nn.ReLU(),
            nn.Linear(4, 2),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(2, 4),
            nn.ReLU(),
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )
        
    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

def normalize_data(data):
    """데이터를 [0, 1] 범위로 정규화"""
    normalized_data = (data - data.min()) / (data.max() - data.min())
    return normalized_data

def train_improved_autoencoder(data, num_epochs=150, batch_size=32, learning_rate=0.0001):
    # 데이터 정규화
    normalized_data = normalize_data(data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]])
    train_data = torch.tensor(normalized_data.values, dtype=torch.float32)
    train_dataset = torch.utils.data.TensorDataset(train_data)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=False)

    model = ImprovedAutoencoder(input_dim=6)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    # 학습 루프
    for epoch in range(num_epochs):
        total_loss = 0
        for batch in train_loader:
            inputs = batch[0]
            outputs = model(inputs)
            loss = criterion(outputs, inputs)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()

        # 매 10 에포크마다 평균 손실 출력
        avg_loss = total_loss / len(train_loader)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Avg Loss: {avg_loss:.4f}")

    # 모델 저장 경로 설정
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # 모델 저장
    model_path = os.path.join(models_dir, "further_improved_trained_autoencoder_korea.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Model saved as {model_path}")

# 데이터 생성 및 표준화 적용
time_steps = 24 * 60 * 60 // 5  # 하루 동안 5초 간격 데이터
data = generate_korean_data(time_steps)
standardized_data = standardize_data_by_sensor(data)  # 표준화 적용

# 모델 학습 실행
train_improved_autoencoder(standardized_data)

