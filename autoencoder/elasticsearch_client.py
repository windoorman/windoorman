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
        Elasticsearch에서 최신 센서 데이터를 가져옵니다.
        :param index_name: 데이터를 조회할 Elasticsearch 인덱스 이름.
        :return: 최신 indoor, outdoor 데이터 (없을 경우 None 반환)
        """
        try:
            response = self.es.search(
                index=index_name,
                body={
                    "size": 1,
                    "sort": [{"@timestamp": {"order": "desc"}}],
                    "_source": ["indoor", "outdoor"]
                }
            )
            if response["hits"]["hits"]:
                data = response["hits"]["hits"][0]["_source"]
                indoor_data = data.get("indoor", {})
                outdoor_data = data.get("outdoor", {})
                return indoor_data, outdoor_data
            else:
                print("[DEBUG] 데이터가 없습니다.")
                return None, None
        except Exception as e:
            print(f"[ERROR] Elasticsearch에서 데이터를 가져오는 중 오류 발생: {e}")
            return None, None
