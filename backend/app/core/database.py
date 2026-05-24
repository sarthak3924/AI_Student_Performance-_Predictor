from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks connections to ensure they are alive before using them
    pool_pre_ping=True
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()

# DB dependency for endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
