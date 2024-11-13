import matplotlib.pyplot as plt
from data_simulator import generate_korean_data

# Generate data
time_steps = 24 * 60 * 60 // 5  # Simulate data for one day (5-second intervals)
data = generate_korean_data(time_steps)

# Convert time to hours for easier plotting
data['time_hours'] = data['time'] / 3600  # Convert seconds to hours

# Plotting the data
fig, axs = plt.subplots(3, 2, figsize=(15, 12))
fig.suptitle('Korean Air Quality and Environmental Data Simulation', fontsize=16)

# Temperature
axs[0, 0].plot(data['time_hours'], data['temperature'], label='Temperature (°C)')
axs[0, 0].set_title("Temperature")
axs[0, 0].set_xlabel("Time (hours)")
axs[0, 0].set_ylabel("Temperature (°C)")

# Humidity
axs[0, 1].plot(data['time_hours'], data['humidity'], label='Humidity (%)', color='teal')
axs[0, 1].set_title("Humidity")
axs[0, 1].set_xlabel("Time (hours)")
axs[0, 1].set_ylabel("Humidity (%)")

# PM10
axs[1, 0].plot(data['time_hours'], data['pm10'], label='PM10 (µg/m³)', color='orange')
axs[1, 0].set_title("PM10")
axs[1, 0].set_xlabel("Time (hours)")
axs[1, 0].set_ylabel("PM10 (µg/m³)")

# PM2.5
axs[1, 1].plot(data['time_hours'], data['pm25'], label='PM2.5 (µg/m³)', color='purple')
axs[1, 1].set_title("PM2.5")
axs[1, 1].set_xlabel("Time (hours)")
axs[1, 1].set_ylabel("PM2.5 (µg/m³)")

# VOC
axs[2, 0].plot(data['time_hours'], data['voc'], label='VOC (ppb)', color='green')
axs[2, 0].set_title("VOC")
axs[2, 0].set_xlabel("Time (hours)")
axs[2, 0].set_ylabel("VOC (ppb)")

# eCO2
axs[2, 1].plot(data['time_hours'], data['eco2'], label='eCO2 (ppm)', color='brown')
axs[2, 1].set_title("eCO2")
axs[2, 1].set_xlabel("Time (hours)")
axs[2, 1].set_ylabel("eCO2 (ppm)")

# Adjust layout and show plot
plt.tight_layout(rect=[0, 0.03, 1, 0.95])
plt.show()
