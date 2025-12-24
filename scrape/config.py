import os
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

class Settings:
    # プロキシ設定（.envファイルから読み込み）
    PROXY_HOST = os.getenv('PROXY_HOST')
    PROXY_PORT = int(os.getenv('PROXY_PORT', '80'))
    HTTP_PROXY = os.getenv('HTTP_PROXY')
    HTTPS_PROXY = os.getenv('HTTPS_PROXY')
    NO_PROXY = os.getenv('NO_PROXY')

settings = Settings()