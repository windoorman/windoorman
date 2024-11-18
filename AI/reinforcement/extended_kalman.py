import numpy as np

class ExtendedKalmanFilter:
    def __init__(self, f, h, F_jacobian, H_jacobian, Q, R, x0, P0):
        self.f = f  # 상태 전이 함수
        self.h = h  # 관측 함수
        self.F_jacobian = F_jacobian  # 상태 전이 함수의 야코비안
        self.H_jacobian = H_jacobian  # 관측 함수의 야코비안
        self.Q = Q  # 프로세스 노이즈 공분산
        self.R = R  # 측정 노이즈 공분산
        self.x = x0  # 초기 상태
        self.P = P0  # 초기 추정 공분산

    def predict(self, u=0):
        # 상태 예측 (비선형 상태 전이 함수 f 사용)
        self.x = self.f(self.x, u)
        F = self.F_jacobian(self.x, u)  # 상태 전이 함수의 야코비안 계산
        self.P = np.dot(np.dot(F, self.P), F.T) + self.Q
        return self.x

    def update(self, z):
        # 관측값 업데이트 (비선형 관측 함수 h 사용)
        y = z - self.h(self.x)  # 관측 오차
        H = self.H_jacobian(self.x)  # 관측 함수의 야코비안 계산
        S = np.dot(np.dot(H, self.P), H.T) + self.R
        K = np.dot(np.dot(self.P, H.T), np.linalg.inv(S))  # 칼만 이득
        self.x = self.x + np.dot(K, y)
        I = np.eye(self.P.shape[0])
        self.P = np.dot((I - np.dot(K, H)), self.P)
        return self.x

# 상태 전이 함수 f (비선형 함수로 가정)
def f(x, u):
    return x + u  # 여기서는 간단히 선형 형태로 설정 가능 (비선형일 때 f 변경 가능)

# 관측 함수 h (비선형 함수로 가정)
def h(x):
    return x  # 실제로는 센서가 비선형적인 데이터를 제공할 수 있음 (예: 로그 함수)

# 상태 전이 함수의 야코비안 계산 (선형일 경우 단순한 형태)
def F_jacobian(x, u):
    return np.eye(len(x))

# 관측 함수의 야코비안 계산 (선형일 경우 단순한 형태)
def H_jacobian(x):
    return np.eye(len(x))

def is_outlier(actual_value, predicted_value, std_dev, threshold=2):
    """
    가우시안 분포 기반으로 이상치인지 체크
    """
    lower_bound = predicted_value - threshold * std_dev - 5
    upper_bound = predicted_value + threshold * std_dev + 5
    print(lower_bound, upper_bound)
    return actual_value < lower_bound or actual_value > upper_bound

# 초기 값 설정
Q = np.eye(1) * 0.1  # 프로세스 노이즈
R = np.eye(1) * 0.5  # 측정 노이즈
x0 = np.array([20])  # 초기 상태 (공기질)
P0 = np.eye(1)  # 초기 추정 공분산

# 확장 칼만 필터 객체 생성
ekf = ExtendedKalmanFilter(f, h, F_jacobian, H_jacobian, Q, R, x0, P0)

# 공기질 임계값 설정
air_quality_threshold = 50  # 공기질 50을 기준으로 판단

# 초기 상태
window_open = False  # 창문 상태 (False = 닫힘, True = 열림)
std_dev = 2  # 표준편차 예시

# 실시간 센서 데이터 (예시 데이터)
sensor_data = [22, 25, 30, 48, 52, 60, 55, 40, 35, 28]

for actual_value in sensor_data:
    # t+1 시점 예측
    predicted_value = ekf.predict()

    # 공기질 예측 값 업데이트
    ekf.update(np.array([actual_value]))

    # 가우시안 분포 기반 이상치 체크
    if is_outlier(actual_value, predicted_value, std_dev):
        print(f"이상치 발생! 공기질 급격한 변화: {actual_value}")
        if actual_value > air_quality_threshold:
            print(f"요리로 판단하여 창문을 엽니다 (공기질: {actual_value})")
            window_open = True
    elif actual_value > air_quality_threshold:
        if window_open:
            print(f"공기질이 {actual_value}로 50을 초과한 상태입니다. 계속 창문을 엽니다.")
        else:
            print(f"공기질이 {actual_value}로 50을 초과하여 창문을 닫습니다.")
            window_open = False
    else:
        if window_open:
            print(f"공기질이 정상 범위로 회복되었습니다. 창문을 닫습니다.")
            window_open = False
        else:
            print(f"공기질이 정상입니다: {actual_value}")

    print(f"현재 창문 상태: {'열림' if window_open else '닫힘'}\n")
