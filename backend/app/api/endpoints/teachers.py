from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api import deps
from ...models import models
from ...schemas import schemas

router = APIRouter()

@router.get("/students")
def get_teacher_students(
    teacher: models.Teacher = Depends(deps.get_current_teacher),
    db: Session = Depends(get_db)
):
    """Returns a list of all students under the teacher's department, including their latest prediction summaries."""
    students = db.query(models.Student).filter(models.Student.department == teacher.department).all()
    
    student_list = []
    for s in students:
        latest_pred = db.query(models.Prediction).filter(models.Prediction.student_id == s.id).order_by(models.Prediction.created_at.desc()).first()
        
        # Calculate live attendance rate
        total_att = db.query(models.Attendance).filter(models.Attendance.student_id == s.id).count()
        present_att = db.query(models.Attendance).filter(
            models.Attendance.student_id == s.id,
            models.Attendance.status.in_(["Present", "Late"])
        ).count()
        attendance_rate = (present_att / total_att * 100.0) if total_att > 0 else 80.0
        
        student_list.append({
            "id": s.id,
            "student_ref_id": s.student_id,
            "name": s.user.full_name,
            "email": s.user.email,
            "course": s.course,
            "semester": s.semester,
            "attendance_rate": round(attendance_rate, 1),
            "predicted_score": latest_pred.predicted_score if latest_pred else None,
            "risk_level": latest_pred.risk_level if latest_pred else "Unknown",
            "confidence_score": latest_pred.confidence_score if latest_pred else None
        })
        
    return student_list

@router.post("/students/{student_id}/assignments")
def create_or_grade_assignment(
    student_id: int,
    assignment: schemas.AssignmentCreate,
    teacher: models.Teacher = Depends(deps.get_current_teacher),
    db: Session = Depends(get_db)
):
    """Creates a new graded assignment sheet for a specific student."""
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    new_assign = models.Assignment(
        student_id=student_id,
        title=assignment.title,
        subject=assignment.subject,
        score=assignment.score,
        max_score=assignment.max_score,
        due_date=assignment.due_date,
        status=assignment.status
    )
    db.add(new_assign)
    
    # Notify student
    db.add(models.Notification(
        user_id=student.user_id,
        title=f"New Graded Work: {assignment.title}",
        message=f"Your submission for {assignment.title} ({assignment.subject}) has been graded: {assignment.score}/{assignment.max_score}."
    ))
    
    db.commit()
    return {"status": "success", "message": "Assignment record saved successfully."}

@router.post("/students/{student_id}/attendance")
def record_student_attendance(
    student_id: int,
    att: schemas.AttendanceCreate,
    teacher: models.Teacher = Depends(deps.get_current_teacher),
    db: Session = Depends(get_db)
):
    """Records class attendance logs (Present, Absent, Late) for a given date."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    record_date = att.date or date.today()
    
    # Check if duplicate date
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id,
        models.Attendance.date == record_date
    ).first()
    
    if existing:
        existing.status = att.status
    else:
        new_att = models.Attendance(
            student_id=student_id,
            date=record_date,
            status=att.status
        )
        db.add(new_att)
        
    # Push low attendance warning to notification triggers if absent
    if att.status == "Absent":
        db.add(models.Notification(
            user_id=student.user_id,
            title="Attendance Alert: Absence Logged",
            message=f"You were marked Absent on {record_date}. Please ensure you maintain attendance above 85%."
        ))
        
    db.commit()
    return {"status": "success", "message": "Attendance log updated."}

@router.get("/weak-students")
def get_at_risk_students(
    teacher: models.Teacher = Depends(deps.get_current_teacher),
    db: Session = Depends(get_db)
):
    """Retrieves all students matching High or Medium Academic Risk flags for intervention planning."""
    students = db.query(models.Student).filter(models.Student.department == teacher.department).all()
    
    at_risk = []
    for s in students:
        latest_pred = db.query(models.Prediction).filter(models.Prediction.student_id == s.id).order_by(models.Prediction.created_at.desc()).first()
        
        if latest_pred and latest_pred.risk_level in ["High", "Medium"]:
            at_risk.append({
                "id": s.id,
                "student_ref_id": s.student_id,
                "name": s.user.full_name,
                "email": s.user.email,
                "course": s.course,
                "risk_level": latest_pred.risk_level,
                "predicted_score": latest_pred.predicted_score,
                "confidence_score": latest_pred.confidence_score,
                "recommendations": latest_pred.recommendations,
                "improvement_strategy": latest_pred.improvement_strategy
            })
            
    return at_risk

@router.get("/analytics/class")
def get_class_analytics(
    teacher: models.Teacher = Depends(deps.get_current_teacher),
    db: Session = Depends(get_db)
):
    """Compiles class performance rankings, grade averages, and attendance distribution curves."""
    students = db.query(models.Student).filter(models.Student.department == teacher.department).all()
    if not students:
        return {"average_gpa": 0, "average_attendance": 0, "risk_distribution": {}, "rankings": []}
        
    rankings = []
    attendance_sum = 0
    score_sum = 0
    predictions_count = 0
    
    risk_counts = {"Low": 0, "Medium": 0, "High": 0}
    
    for s in students:
        # Attendance calculation
        total_att = db.query(models.Attendance).filter(models.Attendance.student_id == s.id).count()
        present_att = db.query(models.Attendance).filter(
            models.Attendance.student_id == s.id,
            models.Attendance.status.in_(["Present", "Late"])
        ).count()
        attendance_rate = (present_att / total_att * 100.0) if total_att > 0 else 85.0
        attendance_sum += attendance_rate
        
        # Latest prediction
        latest_pred = db.query(models.Prediction).filter(models.Prediction.student_id == s.id).order_by(models.Prediction.created_at.desc()).first()
        if latest_pred:
            score_sum += latest_pred.predicted_score
            predictions_count += 1
            risk_counts[latest_pred.risk_level] = risk_counts.get(latest_pred.risk_level, 0) + 1
            predicted_score = latest_pred.predicted_score
            risk_level = latest_pred.risk_level
        else:
            predicted_score = 75.0
            risk_level = "Medium"
            risk_counts["Medium"] += 1
            
        rankings.append({
            "name": s.user.full_name,
            "student_id": s.student_id,
            "predicted_score": predicted_score,
            "attendance": round(attendance_rate, 1),
            "risk_level": risk_level
        })
        
    # Sort rankings by score descending
    rankings = sorted(rankings, key=lambda x: x["predicted_score"], reverse=True)
    
    return {
        "average_attendance": round(attendance_sum / len(students), 1),
        "average_score": round(score_sum / predictions_count, 1) if predictions_count > 0 else 75.0,
        "risk_distribution": [
            {"name": "Low Risk", "value": risk_counts["Low"], "color": "#10B981"},
            {"name": "Medium Risk", "value": risk_counts["Medium"], "color": "#F59E0B"},
            {"name": "High Risk", "value": risk_counts["High"], "color": "#EF4444"}
        ],
        "rankings": rankings
    }
