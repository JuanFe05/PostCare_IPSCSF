import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MYSQL_USER: str = os.getenv("MYSQL_USER")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE")
    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: str = "3306"

    DATABASE_URL = (
        f"mysql+mysqlconnector://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    )

settings = Settings()
