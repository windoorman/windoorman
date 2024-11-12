import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from data_simulator import generate_korean_data
from autoencoder_model import Autoencoder
import os

def train_autoencoder(data, num_epochs=50, batch_size=64, learning_rate=0.001):
    # 6개의 특성을 포함하여 학습 데이터 생성
    train_data = torch.tensor(data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]].values, dtype=torch.float32)
    train_dataset = TensorDataset(train_data)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    model = Autoencoder(input_dim=6)  # input_dim=6으로 설정
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    for epoch in range(num_epochs):
        for batch in train_loader:
            inputs = batch[0]
            outputs = model(inputs)
            loss = criterion(outputs, inputs)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item():.4f}")

    # ../models 폴더 경로 생성
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # 모델 저장
    model_path = os.path.join(models_dir, "trained_autoencoder_korea.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Model saved as {model_path}")

# 데이터 생성 및 학습 실행
time_steps = 24 * 60 * 60 // 5  # 하루 동안 5초 간격 데이터
data = generate_korean_data(time_steps)
train_autoencoder(data)
