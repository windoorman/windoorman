import numpy as np
import pandas as pd

def generate_seasonal_pattern(time, amplitude, offset):
    return amplitude * np.sin(2 * np.pi * time / (365 * 24 * 60 * 60)) + offset

def simulate_temperature(time):
    base_temp = 15 + 10 * np.sin(2 * np.pi * time / (365 * 24 * 60 * 60))
    daily_variation = 5 * np.sin(2 * np.pi * time / (24 * 60 * 60))
    noise = np.random.normal(0, 0.5, len(time))
    return base_temp + daily_variation + noise

def simulate_humidity(time):
    base_humidity = 60 - 15 * np.sin(2 * np.pi * time / (365 * 24 * 60 * 60))
    daily_variation = 10 * np.cos(2 * np.pi * time / (24 * 60 * 60))
    noise = np.random.normal(0, 1, len(time))
    return base_humidity + daily_variation + noise

def simulate_pm10(time):
    seasonal_pm10 = generate_seasonal_pattern(time, 50, 100)
    random_spikes = np.random.choice([0, 150], size=len(time), p=[0.98, 0.02])
    noise = np.random.normal(0, 10, len(time))
    return seasonal_pm10 + random_spikes + noise

def simulate_pm25(time):
    seasonal_pm25 = generate_seasonal_pattern(time, 30, 60)
    random_spikes = np.random.choice([0, 100], size=len(time), p=[0.98, 0.02])
    noise = np.random.normal(0, 5, len(time))
    return seasonal_pm25 + random_spikes + noise

def simulate_voc(time):
    seasonal_voc = generate_seasonal_pattern(time, 25, 50)
    random_spikes = np.random.choice([0, 80], size=len(time), p=[0.98, 0.02])
    noise = np.random.normal(0, 5, len(time))
    return seasonal_voc + random_spikes + noise

def simulate_eco2(time):
    seasonal_eco2 = generate_seasonal_pattern(time, 80, 400)
    random_spikes = np.random.choice([0, 300], size=len(time), p=[0.99, 0.01])
    noise = np.random.normal(0, 15, len(time))
    return seasonal_eco2 + random_spikes + noise

def generate_korean_data(time_steps):
    time = np.arange(time_steps) * 5
    data = pd.DataFrame({
        "time": time,
        "temperature": simulate_temperature(time),
        "humidity": simulate_humidity(time),
        "pm10": simulate_pm10(time),
        "pm25": simulate_pm25(time),
        "voc": simulate_voc(time),
        "eco2": simulate_eco2(time)
    })
    return data
