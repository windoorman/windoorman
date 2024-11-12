from enum import Enum

class WindowAction(Enum):
    OPEN = "창문 열림"
    CLOSE = "창문 닫음"
    NO_ACTION = "No action"

class AnomalyStatus(Enum):
    NORMAL = 0b00
    THRESHOLD_EXCEEDED = 0b01
    ANOMALY_DETECTED = 0b11
