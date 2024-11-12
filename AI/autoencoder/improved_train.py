# improved_autoencoder_training.py - 오토인코더 모델과 학습 코드
import torch
import torch.nn as nn
from data_simulator import generate_korean_data
import os

class ImprovedAutoencoder(nn.Module):
    def __init__(self, input_dim=6):
        super(ImprovedAutoencoder, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 8),
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
            nn.Linear(8, input_dim)
        )
        
    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x

def train_improved_autoencoder(data, num_epochs=100, batch_size=32, learning_rate=0.0005):
    # 데이터 준비
    train_data = torch.tensor(data[["temperature", "humidity", "pm10", "pm25", "voc", "eco2"]].values, dtype=torch.float32)
    train_dataset = torch.utils.data.TensorDataset(train_data)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=False)  # shuffle=False 설정

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

        # 매 에포크마다 평균 손실 출력
        avg_loss = total_loss / len(train_loader)
        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Avg Loss: {avg_loss:.4f}")

    # ../models 폴더 경로 생성
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    # 모델 저장
    model_path = os.path.join(models_dir, "improved_trained_autoencoder_korea.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Model saved as {model_path}")

# 데이터 생성 및 학습 실행
time_steps = 24 * 60 * 60 // 5  # 하루 동안 5초 간격 데이터
data = generate_korean_data(time_steps)
train_improved_autoencoder(data)
