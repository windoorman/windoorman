import yaml

def load_config(path="config/config.yaml"):
    """
    YAML 형식의 설정 파일을 로드합니다.
    :param path: 설정 파일 경로
    :return: 설정 데이터가 담긴 딕셔너리
    """
    with open(path, "r") as file:
        config = yaml.safe_load(file)
    return config
