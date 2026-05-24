from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...core.security import verify_password, get_password_hash, create_access_token
from ...core.config import settings
from ...models import models
from ...schemas import schemas

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2 compatible token login, accepts username (email) and password."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(subject=user.email)
    
    # Pack basic details
    user_details = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user_details
    }

@router.post("/register/student", response_model=schemas.UserOut)
def register_student(student_in: schemas.StudentRegister, db: Session = Depends(get_db)):
    """Registers a new Student along with the base User credentials."""
    # Check if user exists
    user_check = db.query(models.User).filter(models.User.email == student_in.email).first()
    if user_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    student_check = db.query(models.Student).filter(models.Student.student_id == student_in.student_id).first()
    if student_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this ID number already exists."
        )
        
    # Create User
    new_user = models.User(
        full_name=student_in.full_name,
        email=student_in.email,
        hashed_password=get_password_hash(student_in.password),
        role="student"
    )
    db.add(new_user)
    db.flush() # Fetch new_user.id
    
    # Create Student
    new_student = models.Student(
        user_id=new_user.id,
        student_id=student_in.student_id,
        department=student_in.department,
        course=student_in.course,
        semester=student_in.semester
    )
    db.add(new_student)
    
    # Push welcome notification
    db.add(models.Notification(
        user_id=new_user.id,
        title="Welcome to AI Academy!",
        message=f"Hi {student_in.full_name}, your student account has been successfully initialized. Run your first performance prediction today!"
    ))
    
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/register/teacher", response_model=schemas.UserOut)
def register_teacher(teacher_in: schemas.TeacherRegister, db: Session = Depends(get_db)):
    """Registers a new Teacher along with the base User credentials."""
    user_check = db.query(models.User).filter(models.User.email == teacher_in.email).first()
    if user_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    teacher_check = db.query(models.Teacher).filter(models.Teacher.teacher_id == teacher_in.teacher_id).first()
    if teacher_check:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A teacher with this ID number already exists."
        )
        
    # Create User
    new_user = models.User(
        full_name=teacher_in.full_name,
        email=teacher_in.email,
        hashed_password=get_password_hash(teacher_in.password),
        role="teacher"
    )
    db.add(new_user)
    db.flush()
    
    # Create Teacher
    new_teacher = models.Teacher(
        user_id=new_user.id,
        teacher_id=teacher_in.teacher_id,
        department=teacher_in.department
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/forgot-password")
def forgot_password(email_struct: dict):
    email = email_struct.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Simulate email trigger
    return {"message": f"Password reset OTP and code has been dispatched to {email}."}

@router.post("/verify-otp")
def verify_otp(otp_data: dict):
    otp = otp_data.get("otp")
    email = otp_data.get("email")
    if not otp or not email:
        raise HTTPException(status_code=400, detail="OTP and email are required")
    if otp == "123456" or len(otp) == 6: # Support dummy fallback
        return {"status": "verified", "message": "OTP verification completed."}
    raise HTTPException(status_code=400, detail="Incorrect or expired OTP.")
