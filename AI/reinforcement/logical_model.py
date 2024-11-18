import time
import datetime
from enum import Enum

# 센서 데이터를 시뮬레이션하기 위한 임의의 값 생성
import random
from collections import deque

class WindowState(Enum):
    OPEN = '열림'
    CLOSED = '닫힘'

class WindowController:
    def __init__(self):
        self.window_state = WindowState.CLOSED
        self.air_quality_history = deque(maxlen=12)  # 5초 간격으로 1분간 데이터 저장
        self.ventilation_needed = False  # 환기가 필요한 상태인지 표시

    def read_sensors(self):
        # 실제 센서 데이터 읽는 부분을 구현해야 합니다.
        temperature = random.uniform(-10, 40)  # 온도: -10도 ~ 40도
        humidity = random.uniform(10, 90)      # 습도: 10% ~ 90%
        air_quality = random.uniform(0, 200)   # 공기질 지수: 0 ~ 200 (낮을수록 좋음)
        return temperature, humidity, air_quality

    def get_time_info(self):
        now = datetime.datetime.now()
        hour = now.hour
        month = now.month

        # 낮/밤 판단 (6시부터 18시까지를 낮으로 간주)
        if 6 <= hour < 18:
            time_of_day = '낮'
        else:
            time_of_day = '밤'

        # 계절 판단
        if 3 <= month <= 5:
            season = '봄'
        elif 6 <= month <= 8:
            season = '여름'
        elif 9 <= month <= 11:
            season = '가을'
        else:
            season = '겨울'

        return time_of_day, season

    def decide_window_action(self, temperature, humidity, air_quality, time_of_day, season):
        # 기본 설정
        action = self.window_state  # 현재 창문 상태를 기본으로 설정

        # 계절별 쾌적한 온도 범위 설정
        comfortable_temp = {
            '봄': (15, 22),
            '여름': (22, 28),
            '가을': (15, 22),
            '겨울': (18, 24)
        }

        # 공기질 지수 기준
        if air_quality <= 100:
            air_quality_status = '좋음'
        else:
            air_quality_status = '나쁨'

        temp_min, temp_max = comfortable_temp[season]

        # 공기질 변화량 계산
        if len(self.air_quality_history) >= 2:
            prev_time, prev_air_quality = self.air_quality_history[-2]
            curr_time, curr_air_quality = self.air_quality_history[-1]
            time_diff = (curr_time - prev_time).total_seconds()
            air_quality_change = curr_air_quality - prev_air_quality

            if time_diff != 0:
                air_quality_rate = air_quality_change / time_diff  # 초당 변화량
            else:
                air_quality_rate = 0
        else:
            air_quality_change = 0
            air_quality_rate = 0

        # 임계값 설정
        sudden_threshold = 20     # 공기질 지수의 급격한 변화량 임계값
        time_threshold = 60       # 갑작스러운 변화로 간주할 시간 임계값 (초)
        gradual_threshold = 20    # 서서히 변화로 간주할 변화량 임계값
        normal_air_quality = 100  # 공기질 정상 수준 임계값

        # 변화 유형 판단
        sudden_increase = False
        gradual_increase = False

        if len(self.air_quality_history) >= 2:
            if air_quality_change >= sudden_threshold and time_diff <= time_threshold:
                sudden_increase = True
            elif air_quality_change >= gradual_threshold and time_diff > time_threshold:
                gradual_increase = True

        # 창문 상태 결정 로직
        if self.window_state == WindowState.OPEN and self.ventilation_needed:
            # 창문이 열려 있고 환기가 필요한 상태인 경우
            if air_quality <= normal_air_quality:
                # 공기질이 정상으로 돌아오면 창문을 닫고 환기 상태 해제
                self.ventilation_needed = False
                action = WindowState.CLOSED
            else:
                # 공기질이 아직 나쁘므로 창문을 계속 열어둠
                action = WindowState.OPEN
        else:
            # 창문이 닫혀 있는 상태에서 변화 유형 판단
            if sudden_increase:
                # 갑작스러운 공기질 악화 - 환기를 위해 창문을 엽니다.
                self.ventilation_needed = True
                action = WindowState.OPEN
            elif gradual_increase:
                # 서서히 공기질 악화 - 오염된 외부 공기를 차단하기 위해 창문을 닫습니다.
                action = WindowState.CLOSED
            else:
                # 기존 로직 적용
                if (temp_min <= temperature <= temp_max) and (30 <= humidity <= 60) and (air_quality_status == '좋음'):
                    if time_of_day == '낮':
                        action = WindowState.OPEN
                    else:
                        # 밤에는 보안을 위해 창문을 닫습니다.
                        action = WindowState.CLOSED
                else:
                    action = WindowState.CLOSED

        return action

    def control_window(self, action):
        if action != self.window_state:
            self.window_state = action
            print(f"창문 상태 변경: {self.window_state.value}")
            # 실제 창문 제어 코드가 여기 들어가야 합니다.
        else:
            print(f"창문 상태 유지: {self.window_state.value}")

    def run(self):
        try:
            while True:
                temperature, humidity, air_quality = self.read_sensors()
                time_of_day, season = self.get_time_info()

                # 공기질 이력 저장
                self.air_quality_history.append((datetime.datetime.now(), air_quality))

                action = self.decide_window_action(temperature, humidity, air_quality, time_of_day, season)
                self.control_window(action)

                # 센서 데이터와 결정 로그 출력
                print(f"[{datetime.datetime.now()}] 온도: {temperature:.1f}°C, 습도: {humidity:.1f}%, 공기질 지수: {air_quality:.1f}")
                print(f"시간대: {time_of_day}, 계절: {season}")
                print(f"환기 필요 여부: {self.ventilation_needed}")
                print("-" * 50)

                time.sleep(5)  # 5초마다 반복
        except KeyboardInterrupt:
            print("프로그램이 종료되었습니다.")

if __name__ == "__main__":
    controller = WindowController()
    controller.run()
