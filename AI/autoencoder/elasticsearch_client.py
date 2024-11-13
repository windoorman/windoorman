from elasticsearch import Elasticsearch

class ElasticsearchClient:
    def __init__(self, config):
        """
        Elasticsearch 클라이언트 초기화.
        :param config: 설정 파일에서 불러온 Elasticsearch 관련 설정
        """
        host = config["elasticsearch"]["host"]
        username = config["elasticsearch"].get("username")
        password = config["elasticsearch"].get("password")
        
        if username and password:
            self.es = Elasticsearch(host, http_auth=(username, password))
        else:
            self.es = Elasticsearch(host)

    def fetch_latest_sensor_data(self, index_name):
        """
        Elasticsearch에서 최신 실내 및 실외 센서 데이터를 가져옵니다.
        :param index_name: 데이터를 조회할 Elasticsearch 인덱스 이름.
        :return: 최신 실내 및 실외 데이터 (없을 경우 None 반환)
        """
        try:
            # 최신 실내 데이터 조회
            indoor_response = self.es.search(
                index=index_name,
                body={
                    "size": 1,
                    "sort": [{"@timestamp": {"order": "desc"}}],
                    "query": {"term": {"isInside": 1}},
                    "_source": ["pm25", "pm10", "co2", "tvoc", "temp", "humid", "windowsId", "placeId", "isInside"]
                }
            )
            # 최신 실외 데이터 조회
            outdoor_response = self.es.search(
                index=index_name,
                body={
                    "size": 1,
                    "sort": [{"@timestamp": {"order": "desc"}}],
                    "query": {"term": {"isInside": 0}},
                    "_source": ["pm25", "pm10", "co2", "tvoc", "temp", "humid", "windowsId", "placeId", "isInside"]
                }
            )

            # 실내 데이터
            indoor_data = indoor_response["hits"]["hits"][0]["_source"] if indoor_response["hits"]["hits"] else None
            # 실외 데이터
            outdoor_data = outdoor_response["hits"]["hits"][0]["_source"] if outdoor_response["hits"]["hits"] else None

            return indoor_data, outdoor_data
        except Exception as e:
            print(f"[ERROR] Elasticsearch에서 데이터를 가져오는 중 오류 발생: {e}")
            return None, None
