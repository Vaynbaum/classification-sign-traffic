from typing import List
from pydantic_settings import BaseSettings
import pymongo


class Settings(BaseSettings):
    CORS_URL: List[str]
    NAME_MODEL: str
    HOST: str
    PORT: str

    class Config:
        env_file = ".env"


settings = Settings()

model = None
device = None
data = {}

url = f"mongodb://{settings.HOST}:{settings.PORT}/"
mongodb_client = pymongo.MongoClient(url)
db = mongodb_client["traffic-signs"]
col = db["reports"]
