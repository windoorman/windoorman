package com.window.domain.monitoring.dto;

import java.time.LocalDateTime;
import java.util.Objects;

public class WindowData {
    private String windowId;      // ID of the specific window
    private Double co2;           // CO₂ sensor data
    private Double voc;           // VOC sensor data
    private Double pm25;          // PM2.5 sensor data
    private Double pm10;          // PM10 sensor data
    private Double temperature;   // Temperature sensor data
    private Double humidity;      // Humidity sensor data
    private LocalDateTime timestamp; // Timestamp of the data

    // Constructors, Getters, and Setters
    public WindowData() {}

    public WindowData(String windowId, Double co2, Double voc, Double pm25, Double pm10,
                      Double temperature, Double humidity, LocalDateTime timestamp) {
        this.windowId = windowId;
        this.co2 = co2;
        this.voc = voc;
        this.pm25 = pm25;
        this.pm10 = pm10;
        this.temperature = temperature;
        this.humidity = humidity;
        this.timestamp = timestamp;
    }

    // Getters and setters for each field
    public String getWindowId() {
        return windowId;
    }

    public void setWindowId(String windowId) {
        this.windowId = windowId;
    }

    public Double getCo2() {
        return co2;
    }

    public void setCo2(Double co2) {
        this.co2 = co2;
    }

    public Double getVoc() {
        return voc;
    }

    public void setVoc(Double voc) {
        this.voc = voc;
    }

    public Double getPm25() {
        return pm25;
    }

    public void setPm25(Double pm25) {
        this.pm25 = pm25;
    }

    public Double getPm10() {
        return pm10;
    }

    public void setPm10(Double pm10) {
        this.pm10 = pm10;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    // Optional: Override equals() and hashCode() for comparison purposes
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        WindowData that = (WindowData) obj;
        return Objects.equals(windowId, that.windowId) &&
                Objects.equals(co2, that.co2) &&
                Objects.equals(voc, that.voc) &&
                Objects.equals(pm25, that.pm25) &&
                Objects.equals(pm10, that.pm10) &&
                Objects.equals(temperature, that.temperature) &&
                Objects.equals(humidity, that.humidity) &&
                Objects.equals(timestamp, that.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(windowId, co2, voc, pm25, pm10, temperature, humidity, timestamp);
    }
}
