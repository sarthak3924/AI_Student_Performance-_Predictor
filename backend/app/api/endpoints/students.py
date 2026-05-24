import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.config import settings
from ...api import deps
from ...models import models
from ...schemas import schemas
from ...services.chatbot import get_chatbot_response
from ...services.pdf_generator import generate_student_report_pdf

router = APIRouter()

@router.get("/profile", response_model=schemas.StudentOut)
def get_student_profile(student: models.Student = Depends(deps.get_current_student)):
    """Returns student profile details."""
    return student

@router.get("/performance")
def get_student_performance(
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Calculates live GPA metrics, attendance rates, recent assignments, and active predictions."""
    # 1. Fetch recent assignments
    assignments = db.query(models.Assignment).filter(models.Assignment.student_id == student.id).order_by(models.Assignment.due_date.desc()).all()
    
    # Calculate average assignment score percentage
    avg_score = 0.0
    graded_assignments = [a for a in assignments if a.status == "Graded" and a.max_score > 0]
    if graded_assignments:
        avg_score = sum((a.score / a.max_score) * 100.0 for a in graded_assignments) / len(graded_assignments)
    else:
        avg_score = 75.0 # fallback default for fresh students
        
    # 2. Calculate attendance rate
    total_att = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).count()
    present_att = db.query(models.Attendance).filter(
        models.Attendance.student_id == student.id,
        models.Attendance.status.in_(["Present", "Late"])
    ).count()
    
    attendance_rate = (present_att / total_att * 100.0) if total_att > 0 else 85.0
    
    # 3. Get latest prediction
    latest_prediction = db.query(models.Prediction).filter(models.Prediction.student_id == student.id).order_by(models.Prediction.created_at.desc()).first()
    
    # 4. Mock GPA Trend (based on semester and assignments)
    gpa_trend = [
        {"semester": "Sem 1", "gpa": 3.2},
        {"semester": "Sem 2", "gpa": 3.4},
        {"semester": "Sem 3", "gpa": 3.1},
        {"semester": "Sem 4", "gpa": 3.5},
        {"semester": "Sem 5", "gpa": round(2.0 + (avg_score/25.0), 2) if student.semester > 5 else 3.6}
    ]
    
    # Subject breakdown
    subject_performance = [
        {"subject": "Mathematics", "score": round(avg_score * 0.95, 1)},
        {"subject": "Physics", "score": round(avg_score * 0.90, 1)},
        {"subject": "Computer Programming", "score": round(avg_score * 1.05 if avg_score * 1.05 <= 100 else 100.0, 1)},
        {"subject": "Data Science", "score": round(avg_score, 1)}
    ]
    
    # Weekly study hours analytics (mock representation for charts)
    study_analytics = [
        {"day": "Mon", "hours": 2.5},
        {"day": "Tue", "hours": 3.0},
        {"day": "Wed", "hours": 1.5},
        {"day": "Thu", "hours": 4.0},
        {"day": "Fri", "hours": 2.0},
        {"day": "Sat", "hours": 5.0},
        {"day": "Sun", "hours": 3.0}
    ]
    
    return {
        "attendance_rate": round(attendance_rate, 1),
        "assignment_average": round(avg_score, 1),
        "latest_prediction": latest_prediction,
        "gpa_trend": gpa_trend[:student.semester],
        "subject_performance": subject_performance,
        "study_analytics": study_analytics,
        "assignments": assignments
    }

@router.post("/predict", response_model=schemas.PredictionOut)
def run_prediction(
    req: schemas.PredictionRequest,
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Hits the external ML microservice to run a student prediction, saves findings, and returns details."""
    payload = {
        "attendance": req.attendance,
        "study_hours": req.study_hours,
        "previous_grades": req.previous_grades,
        "assignment_scores": req.assignment_scores,
        "sleep_hours": req.sleep_hours,
        "internet_access": req.internet_access,
        "participation": req.participation,
        "family_support": req.family_support
    }
    
    try:
        response = requests.post(f"{settings.ML_SERVICE_URL}/predict", json=payload, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="ML Service prediction failed.")
        res_data = response.json()
    except Exception as e:
        # Build local fallback if ML service is building or restarting
        # Calculate grade estimation
        score = (0.3 * req.attendance + 0.3 * req.previous_grades + 0.2 * req.assignment_scores + 0.2 * req.study_hours * 3.3)
        score = max(40.0, min(100.0, score))
        risk = "Low" if score >= 78 else "Medium" if score >= 60 else "High"
        res_data = {
            "predicted_score": round(score, 2),
            "risk_level": risk,
            "confidence_score": 0.85,
            "recommendations": "Local predictive safety fallback activated. Review study schedules.",
            "improvement_strategy": "Maintain 15+ study hours, attend review labs, track assignment submissions.",
            "model_used": "Local fallback calculator"
        }
        
    # Write to predictions table
    new_prediction = models.Prediction(
        student_id=student.id,
        attendance_rate=req.attendance,
        study_hours=req.study_hours,
        previous_grades=req.previous_grades,
        assignment_scores=req.assignment_scores,
        sleep_hours=req.sleep_hours,
        internet_access=req.internet_access == 1,
        participation=req.participation,
        family_support=req.family_support,
        predicted_score=res_data["predicted_score"],
        risk_level=res_data["risk_level"],
        confidence_score=res_data["confidence_score"],
        recommendations=res_data["recommendations"],
        improvement_strategy=res_data["improvement_strategy"]
    )
    db.add(new_prediction)
    
    # Notify student if high risk
    if res_data["risk_level"] == "High":
        db.add(models.Notification(
            user_id=student.user_id,
            title="Warning: High Academic Risk Flagged",
            message="Your latest predictive run indicates a High Academic Risk level. View our advisor recommendations for guidance."
        ))
        
    db.commit()
    db.refresh(new_prediction)
    return new_prediction

@router.get("/prediction-history")
def get_prediction_history(
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Returns previous prediction runs."""
    return db.query(models.Prediction).filter(models.Prediction.student_id == student.id).order_by(models.Prediction.created_at.desc()).all()

@router.post("/chatbot")
def query_advisor(
    payload: dict,
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Interacts with the NLP counselor chatbot, loaded with the student's metrics context."""
    query = payload.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query string is required")
        
    # 1. Fetch latest stats to feed context
    perf = get_student_performance(student, db)
    latest_pred = perf["latest_prediction"]
    
    metrics = {
        "attendance": perf["attendance_rate"],
        "study_hours": latest_pred.study_hours if latest_pred else 12.0,
        "predicted_score": latest_pred.predicted_score if latest_pred else 75.0,
        "risk_level": latest_pred.risk_level if latest_pred else "Medium",
        "sleep_hours": latest_pred.sleep_hours if latest_pred else 7.0,
        "assignment_scores": perf["assignment_average"],
        "participation": latest_pred.participation if latest_pred else 70.0
    }
    
    response_text = get_chatbot_response(query, student.user.full_name, metrics)
    return {"response": response_text}

@router.get("/notifications")
def get_notifications(
    user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Returns user notifications."""
    return db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.created_at.desc()).all()

@router.put("/notifications/{notif_id}/read")
def read_notification(
    notif_id: int,
    user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(get_db)
):
    """Marks notification as read."""
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "success"}

@router.get("/reports/download")
def download_pdf_report(
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Generates and serves a PDF file representation of student performance and recommendations."""
    # 1. Compile details
    assignments = db.query(models.Assignment).filter(models.Assignment.student_id == student.id).all()
    latest_pred = db.query(models.Prediction).filter(models.Prediction.student_id == student.id).order_by(models.Prediction.created_at.desc()).first()
    
    # Calculate attendance rate
    total_att = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).count()
    present_att = db.query(models.Attendance).filter(
        models.Attendance.student_id == student.id,
        models.Attendance.status.in_(["Present", "Late"])
    ).count()
    attendance_rate = (present_att / total_att * 100.0) if total_att > 0 else 85.0
    
    if not latest_pred:
        # If no prediction exists, construct mock/default prediction structure
        latest_pred = {
            "predicted_score": 75.0,
            "risk_level": "Medium",
            "confidence_score": 0.8,
            "study_hours": 12.0,
            "participation": 70.0,
            "recommendations": "Complete pending assignments and attend tutorials.",
            "improvement_strategy": "Maintain at least 12 hours of weekly study and raise attendance."
        }
    else:
        # Convert model object to dictionary
        latest_pred = {
            "predicted_score": latest_pred.predicted_score,
            "risk_level": latest_pred.risk_level,
            "confidence_score": latest_pred.confidence_score,
            "study_hours": latest_pred.study_hours,
            "participation": latest_pred.participation,
            "recommendations": latest_pred.recommendations,
            "improvement_strategy": latest_pred.improvement_strategy
        }
        
    student_data = {
        "student_id": student.student_id,
        "department": student.department,
        "course": student.course,
        "semester": student.semester,
        "user": {
            "full_name": student.user.full_name,
            "email": student.user.email
        }
    }
    
    try:
        report_url = generate_student_report_pdf(student_data, latest_pred, assignments, attendance_rate)
        # Serving the file directly
        file_path = os.path.join("/app/app", report_url.lstrip("/"))
        
        # Log this report creation
        db.add(models.Report(
            student_id=student.id,
            generated_by=student.user_id,
            title="Student Progress Report",
            file_path=file_path
        ))
        db.commit()
        
        return FileResponse(file_path, media_type="application/pdf", filename=f"{student.student_id}_Report.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {str(e)}")
        
@router.get("/assignments")
def get_assignments(
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Returns student's assignment sheet."""
    return db.query(models.Assignment).filter(models.Assignment.student_id == student.id).order_by(models.Assignment.due_date.asc()).all()

@router.get("/attendance")
def get_attendance_history(
    student: models.Student = Depends(deps.get_current_student),
    db: Session = Depends(get_db)
):
    """Returns student's detailed attendance records."""
    return db.query(models.Attendance).filter(models.Attendance.student_id == student.id).order_by(models.Attendance.date.desc()).all()
