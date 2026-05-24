import os
from datetime import date, timedelta
from sqlalchemy.orm import Session
from ..models import models
from ..core.security import get_password_hash

def seed_database(db: Session):
    """Seeds the database with admin, teacher, student, attendance, assignment, and prediction profiles."""
    
    # Ensure Admin account exists
    admin_user = db.query(models.User).filter(models.User.email == "admin@aiacademy.com").first()
    if not admin_user:
        admin_user = models.User(
            full_name="System Admin",
            email="admin@aiacademy.com",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("Admin user seeded programmatically.")
    else:
        # Force update password hash to guarantee it matches "admin123" under direct bcrypt execution
        admin_user.hashed_password = get_password_hash("admin123")
        db.commit()
        print("Admin password hash updated programmatically.")

    # 1. Check if seeded already (e.g., if students exist)
    if db.query(models.Student).count() > 0:
        print("Database already seeded. Skipping...")
        return
        
    print("Seeding database with demo data...")
    
    # 2. Add Teachers
    teachers_data = [
        {"name": "Dr. Charles Xavier", "email": "charles@academy.com", "id": "TCH001", "dept": "Computer Science"},
        {"name": "Prof. Jean Grey", "email": "jean@academy.com", "id": "TCH002", "dept": "Data Science"}
    ]
    
    teachers_list = []
    for t in teachers_data:
        user = db.query(models.User).filter_by(email=t["email"]).first()
        if not user:
            user = models.User(
                full_name=t["name"],
                email=t["email"],
                hashed_password=get_password_hash("teacher123"),
                role="teacher"
            )
            db.add(user)
            db.flush() # get user.id
            
            teacher = models.Teacher(
                user_id=user.id,
                teacher_id=t["id"],
                department=t["dept"]
            )
            db.add(teacher)
            teachers_list.append(teacher)
            
    # 3. Add Students with diverse metrics
    students_data = [
        {
            "name": "Jane Doe", "email": "jane@student.com", "id": "STU101", 
            "dept": "Computer Science", "course": "B.Tech CSE", "sem": 6,
            "metrics": {
                "attendance": 92.5, "study_hours": 18.0, "previous_grades": 85.0, 
                "assignment_scores": 88.0, "sleep_hours": 7.5, "internet_access": True, 
                "participation": 80.0, "family_support": 85.0, "score": 86.4, 
                "risk": "Low", "confidence": 0.94, "recs": "Maintain habits", "strat": "Keep studying"
            }
        },
        {
            "name": "John Smith", "email": "john@student.com", "id": "STU102", 
            "dept": "Computer Science", "course": "B.Tech CSE", "sem": 6,
            "metrics": {
                "attendance": 64.0, "study_hours": 4.5, "previous_grades": 58.0, 
                "assignment_scores": 52.0, "sleep_hours": 5.0, "internet_access": True, 
                "participation": 40.0, "family_support": 50.0, "score": 54.2, 
                "risk": "High", "confidence": 0.88, 
                "recs": "Critical: Raise attendance and study hours", 
                "strat": "Mandatory tutoring, target 85% attendance, sleep hygiene"
            }
        },
        {
            "name": "Alice Cooper", "email": "alice@student.com", "id": "STU103", 
            "dept": "Data Science", "course": "B.Sc Data Science", "sem": 4,
            "metrics": {
                "attendance": 81.0, "study_hours": 10.0, "previous_grades": 72.0, 
                "assignment_scores": 75.0, "sleep_hours": 6.5, "internet_access": True, 
                "participation": 65.0, "family_support": 70.0, "score": 71.8, 
                "risk": "Medium", "confidence": 0.81, 
                "recs": "Increase study time and attendance", 
                "strat": "Aim for 12 hours/week self-study and front-row engagement"
            }
        },
        {
            "name": "Bob Marley", "email": "bob@student.com", "id": "STU104", 
            "dept": "Data Science", "course": "B.Sc Data Science", "sem": 4,
            "metrics": {
                "attendance": 52.0, "study_hours": 3.0, "previous_grades": 50.0, 
                "assignment_scores": 48.0, "sleep_hours": 4.5, "internet_access": False, 
                "participation": 30.0, "family_support": 35.0, "score": 45.1, 
                "risk": "High", "confidence": 0.92, 
                "recs": "Urgent intervention required. Low attendance & study hours", 
                "strat": "Contact academic counseling, secure internet access loan, structured schedule"
            }
        },
        {
            "name": "Peter Parker", "email": "peter@student.com", "id": "STU105", 
            "dept": "Computer Science", "course": "B.Tech CSE", "sem": 6,
            "metrics": {
                "attendance": 76.5, "study_hours": 9.0, "previous_grades": 82.0, 
                "assignment_scores": 74.0, "sleep_hours": 5.5, "internet_access": True, 
                "participation": 85.0, "family_support": 90.0, "score": 78.5, 
                "risk": "Medium", "confidence": 0.79, 
                "recs": "Increase study focus and sleep", 
                "strat": "Set 8 hours sleep target, boost study hours to 12/week"
            }
        }
    ]
    
    students_list = []
    for s in students_data:
        user = db.query(models.User).filter_by(email=s["email"]).first()
        if not user:
            user = models.User(
                full_name=s["name"],
                email=s["email"],
                hashed_password=get_password_hash("student123"),
                role="student"
            )
            db.add(user)
            db.flush()
            
            student = models.Student(
                user_id=user.id,
                student_id=s["id"],
                department=s["dept"],
                course=s["course"],
                semester=s["sem"]
            )
            db.add(student)
            db.flush()
            students_list.append((student, s["metrics"]))
            
    # 4. Add Attendance for the last 15 days
    for student, metrics in students_list:
        att_rate = metrics["attendance"]
        for day_idx in range(15):
            eval_date = date.today() - timedelta(days=day_idx)
            # Make sure date doesn't land on weekends for realism, but daily seed is fine
            # Determine presence based on student's attendance rate
            status = "Present"
            rand_val = hash(f"{student.id}-{day_idx}") % 100
            if rand_val > att_rate:
                status = "Absent" if rand_val % 3 != 0 else "Late"
                
            attendance_record = models.Attendance(
                student_id=student.id,
                date=eval_date,
                status=status
            )
            db.add(attendance_record)

    # 5. Add Assignments (Math, Physics, Programming)
    subjects = ["Mathematics", "Physics", "Computer Programming", "Data Science"]
    for student, metrics in students_list:
        score_factor = metrics["assignment_scores"] / 100.0
        
        # Assignment 1: Graded
        a1 = models.Assignment(
            student_id=student.id,
            title="Linear Algebra & Calculus Quiz",
            subject="Mathematics",
            score=round(100 * score_factor + (hash(f"{student.id}-a1") % 10 - 5), 1),
            max_score=100.0,
            due_date=date.today() - timedelta(days=10),
            status="Graded"
        )
        # Clip score
        a1.score = max(0.0, min(100.0, a1.score))
        db.add(a1)
        
        # Assignment 2: Graded
        a2 = models.Assignment(
            student_id=student.id,
            title="Newtonian Mechanics lab",
            subject="Physics",
            score=round(50 * score_factor + (hash(f"{student.id}-a2") % 5 - 2.5), 1),
            max_score=50.0,
            due_date=date.today() - timedelta(days=5),
            status="Graded"
        )
        a2.score = max(0.0, min(50.0, a2.score))
        db.add(a2)

        # Assignment 3: Submitted (needs grading)
        a3 = models.Assignment(
            student_id=student.id,
            title="OOP Polymorphism lab",
            subject="Computer Programming",
            score=0.0,
            max_score=100.0,
            due_date=date.today() - timedelta(days=1),
            status="Submitted"
        )
        db.add(a3)

        # Assignment 4: Pending (Future due date)
        a4 = models.Assignment(
            student_id=student.id,
            title="Data Scraping & EDA project",
            subject="Data Science",
            score=0.0,
            max_score=150.0,
            due_date=date.today() + timedelta(days=6),
            status="Pending"
        )
        db.add(a4)

    # 6. Add Predictions
    for student, m in students_list:
        prediction = models.Prediction(
            student_id=student.id,
            attendance_rate=m["attendance"],
            study_hours=m["study_hours"],
            previous_grades=m["previous_grades"],
            assignment_scores=m["assignment_scores"],
            sleep_hours=m["sleep_hours"],
            internet_access=m["internet_access"],
            participation=m["participation"],
            family_support=m["family_support"],
            predicted_score=m["score"],
            risk_level=m["risk"],
            confidence_score=m["confidence"],
            recommendations=m["recs"],
            improvement_strategy=m["strat"]
        )
        db.add(prediction)

    # 7. Commit everything
    db.commit()
    print("Database seeding completed successfully.")
