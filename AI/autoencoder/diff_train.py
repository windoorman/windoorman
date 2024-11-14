import torch
import torch.nn as nn
import os
import json
from data_simulator import generate_korean_data
from torch.optim.lr_scheduler import CosineAnnealingWarmRestarts

def normalize_data(data, means, stds):
    """센서별 개별 표준화를 적용하여 데이터 정규화"""
    normalized_data = data.copy()
    for column in data.columns:
        normalized_data[column] = (data[column] - means[column]) / stds[column]
    return normalized_data

def calculate_differences(data):
    """현재 측정치와 직전 측정치의 차이 계산 후 NaN 제거"""
    diff_data = data.diff().dropna()  # 첫 번째 행의 NaN 제거
    return diff_data

def save_means_and_stds(means, stds, file_path="sensor_diff_means_stds.json"):
    """차이 값의 평균 및 표준편차를 파일에 저장"""
    with open(file_path, 'w') as f:
        json.dump({"means": means.to_dict(), "stds": stds.to_dict()}, f)
    print(f"Means and stds saved to {file_path}")

class DifferenceAutoencoder(nn.Module):
    def __init__(self, input_dim=6):
        super(DifferenceAutoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(8, 4),
            nn.ReLU()
        )
        self.decoder = nn.Sequential(
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, input_dim)
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

def train_improved_autoencoder(data, means, stds, num_epochs=200, batch_size=32, learning_rate=0.001, model_path=""):
    # 센서별 개별 표준화를 적용하여 정규화된 데이터를 사용하여 학습
    normalized_data = normalize_data(data, means, stds)
    train_data = torch.tensor(normalized_data.values, dtype=torch.float32)
    train_dataset = torch.utils.data.TensorDataset(train_data)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=False)

    model = DifferenceAutoencoder(input_dim=6)
    criterion = nn.SmoothL1Loss()  # 후버 손실(Huber Loss) 적용
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=0.01)  # AdamW 옵티마이저 적용

    # CosineAnnealingLR 스케줄러 설정
    scheduler = CosineAnnealingWarmRestarts(optimizer, T_0=50, T_mult=2, eta_min=0.0002)

    for epoch in range(num_epochs):
        total_loss = 0
        for batch in train_loader:
            inputs = batch[0]
            outputs = model(inputs)

            # 손실 계산
            loss = criterion(outputs, inputs)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        # 스케줄러 업데이트
        scheduler.step()

        # 매 10 에포크마다 평균 손실 출력
        avg_loss = total_loss / len(train_loader)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Avg Loss: {avg_loss:.4f}, Learning Rate: {optimizer.param_groups[0]['lr']}")

    torch.save(model.state_dict(), model_path)
    print(f"Model saved as {model_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, "diff_trained_autoencoder_korea.pth")
    json_path = os.path.join(models_dir, "sensor_diff_means_stds.json")

    # 데이터 생성 및 차이 값 계산
    time_steps = 24 * 60 * 60 // 5  # 하루 동안 5초 간격 데이터
    data = generate_korean_data(time_steps)
    diff_data = calculate_differences(data)

    # time 열을 별도로 보존하며, 센서 열만 학습에 사용
    time_column = diff_data["time"]  # time 열 보존
    sensor_data = diff_data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]]

    # 센서 데이터의 평균 및 표준편차 계산 후 저장
    if not sensor_data.empty:
        means, stds = sensor_data.mean(), sensor_data.std()
        save_means_and_stds(means, stds, file_path=json_path)
        
        # 정규화된 센서 데이터를 사용하여 모델 학습
        train_improved_autoencoder(sensor_data, means, stds, model_path=model_path)
    else:
        print("Error: No data available after calculating differences.")
