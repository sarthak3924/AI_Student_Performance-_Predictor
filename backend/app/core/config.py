import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Student Analytics Portal"
    ENV: str = "production"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres_secure_pass_2026@localhost:5432/student_prediction_db"
    )
    
    # Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretjwtkeyforstudentprediction2026!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours
    
    # ML Service Link
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
    
    class Config:
        case_sensitive = True

settings = Settings()
