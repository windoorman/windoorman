# import torch
# import numpy as np
# from autoencoder_model import Autoencoder

# def detect_anomaly(data, model, thresholds):
#     input_values = list(data.values())  # 6개 특성 포함
#     input_data = torch.tensor(input_values, dtype=torch.float16).unsqueeze(0)
    
#     model = model.half()
#     with torch.no_grad():
#         reconstructed_data = model(input_data)
    
#     reconstruction_error = (input_data - reconstructed_data).float().abs().numpy()
#     anomalies = {sensor: error > thresholds[sensor] for sensor, error in zip(thresholds.keys(), reconstruction_error[0])}
#     return anomalies
import torch
import numpy as np
from autoencoder_model import Autoencoder

def detect_anomaly(data, model, thresholds):
    input_values = list(data.values())  # 6개 특성 포함
    input_data = torch.tensor(input_values, dtype=torch.float16).unsqueeze(0)  # float16으로 설정

    model = model.half()  # 모델을 half로 설정하여 일관성 유지
    with torch.no_grad():
        reconstructed_data = model(input_data)

    # print(f"inco:{input_data}  deco:{reconstructed_data}")
    reconstruction_error = (input_data - reconstructed_data).abs().cpu().numpy()
    anomalies = {sensor: error > thresholds[sensor] for sensor, error in zip(thresholds.keys(), reconstruction_error[0])}
    return anomalies

