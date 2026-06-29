import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "HemaVision AI"
    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Security
    SECRET_KEY: str = "super-secret-key-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for dev convenience
    
    # Database
    DATABASE_URL: str = "sqlite:///./hemavision.db"
    
    # Storage Paths
    UPLOAD_DIR: str = str(BASE_DIR / "data" / "uploads")
    MODEL_DIR: str = str(BASE_DIR / "data" / "models")
    KNOWLEDGE_DIR: str = str(BASE_DIR / "data" / "knowledge")
    
    # AI/ML Models
    HF_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    HF_LLM_MODEL: str = "Qwen/Qwen2.5-1.5B-Instruct"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create directories if they do not exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.KNOWLEDGE_DIR, exist_ok=True)
