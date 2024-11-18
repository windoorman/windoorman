# import os
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '0'  # 모든 디버깅 정보를 출력

# import tensorflow as tf

# gpus = tf.config.experimental.list_physical_devices('GPU')
# if gpus:
#     for gpu in gpus:
#         tf.config.experimental.set_memory_growth(gpu, True)
#     print(f"사용 가능한 GPU 장치: {gpus}")
# else:
#     print("GPU가 없습니다. CPU만 사용 중입니다.")


import tensorflow as tf
print(tf.sysconfig.get_build_info()["cuda_version"])  # CUDA 버전
print(tf.sysconfig.get_build_info()["cudnn_version"]) # cuDNN 버전
