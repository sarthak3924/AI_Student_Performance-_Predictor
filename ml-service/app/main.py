import os
import json
import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .pipeline import train_pipeline, predict_single, METRICS_PATH, CSV_PATH

app = FastAPI(
    title="AI Analytics Prediction API",
    description="Microservice providing machine learning modeling for student risk and performance analysis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentFeatures(BaseModel):
    attendance: float = Field(..., ge=0, le=100, description="Attendance rate (0-100)")
    study_hours: float = Field(..., ge=0, le=168, description="Weekly study hours")
    previous_grades: float = Field(..., ge=0, le=100, description="Previous grade percentage (0-100)")
    assignment_scores: float = Field(..., ge=0, le=100, description="Average assignment scores (0-100)")
    sleep_hours: float = Field(..., ge=0, le=24, description="Average daily sleep hours")
    internet_access: int = Field(..., ge=0, le=1, description="Internet access (1: Yes, 0: No)")
    participation: float = Field(..., ge=0, le=100, description="Class participation rate (0-100)")
    family_support: float = Field(..., ge=0, le=100, description="Family support index (0-100)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "attendance": 85.5,
                "study_hours": 12.0,
                "previous_grades": 78.0,
                "assignment_scores": 82.5,
                "sleep_hours": 7.5,
                "internet_access": 1,
                "participation": 70.0,
                "family_support": 80.0
            }
        }
    }

@app.get("/")
def read_root():
    return {"status": "online", "service": "ML Prediction Engine"}

@app.post("/predict")
def predict(features: StudentFeatures):
    try:
        prediction = predict_single(features.model_dump())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/train")
def train_models():
    try:
        metrics = train_pipeline()
        return {"message": "Models trained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")

@app.get("/metrics")
def get_metrics():
    if not os.path.exists(METRICS_PATH):
        # Auto-train to generate metrics if they don't exist
        try:
            metrics = train_pipeline()
            return metrics
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to auto-train: {str(e)}")
            
    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
    return metrics

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        # Save uploaded file over student_data.csv
        with open(CSV_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Re-train models with new dataset
        metrics = train_pipeline()
        return {
            "message": "Dataset uploaded and models trained successfully",
            "dataset_size": metrics.get("dataset_size", 0),
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset processing error: {str(e)}")
