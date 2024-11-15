from enum import Enum

class WindowAction(Enum):
    OPEN = "open"
    CLOSE = "close"
    NO_ACTION = "No action"

class AnomalyStatus(Enum):
    NORMAL = 0b00
    THRESHOLD_EXCEEDED = 0b01
    ANOMALY_DETECTED = 0b11
