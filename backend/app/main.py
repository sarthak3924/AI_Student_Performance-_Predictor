import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .core.config import settings
from .core.database import engine, Base, SessionLocal
from .models import models
from .services.seeder import seed_database
from .api.endpoints import auth, students, teachers, admins

# Auto-create tables (in production, we might use alembic, but metadata.create_all is standard and robust for initial containers)
Base.metadata.create_all(bind=engine)

# Ensure static directories for reports exist
REPORTS_DIR = "/app/app/static/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API powering authentication, analytics dashboards, reports, and counselor chatbot.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# Mount Static Files (PDF Reports)
app.mount("/static", StaticFiles(directory="/app/app/static"), name="static")

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(students.router, prefix=f"{settings.API_V1_STR}/student", tags=["Student Portal"])
app.include_router(teachers.router, prefix=f"{settings.API_V1_STR}/teacher", tags=["Teacher Portal"])
app.include_router(admins.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin Portal"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENV,
        "api_docs": "/docs"
    }
