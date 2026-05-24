from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: dict

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: str = Field(..., description="Must be 'student', 'teacher', or 'admin'")

class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Student / Teacher Registration
class StudentRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    student_id: str
    department: str
    course: str
    semester: int = 1

class TeacherRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    teacher_id: str
    department: str

# Portal Specific Profile Information
class StudentOut(BaseModel):
    id: int
    student_id: str
    department: str
    course: str
    semester: int
    user: UserOut

    class Config:
        from_attributes = True

class TeacherOut(BaseModel):
    id: int
    teacher_id: str
    department: str
    user: UserOut

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionRequest(BaseModel):
    attendance: float
    study_hours: float
    previous_grades: float
    assignment_scores: float
    sleep_hours: float
    internet_access: int
    participation: float
    family_support: float

class PredictionOut(BaseModel):
    id: int
    student_id: int
    attendance_rate: float
    study_hours: float
    previous_grades: float
    assignment_scores: float
    sleep_hours: float
    internet_access: bool
    participation: float
    family_support: float
    predicted_score: float
    risk_level: str
    confidence_score: float
    recommendations: Optional[str]
    improvement_strategy: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceCreate(BaseModel):
    student_id: int
    status: str = Field(..., description="Must be 'Present', 'Absent', or 'Late'")
    date: Optional[date] = None

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    date: date
    status: str

    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentCreate(BaseModel):
    student_id: int
    title: str
    subject: str
    score: Optional[float] = 0.0
    max_score: Optional[float] = 100.0
    due_date: date
    status: str = "Pending"

class AssignmentOut(BaseModel):
    id: int
    student_id: int
    title: str
    subject: str
    score: float
    max_score: float
    due_date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportOut(BaseModel):
    id: int
    student_id: int
    generated_by: int
    title: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True
        
# Dashboard Metrics
class DashboardStatCard(BaseModel):
    label: str
    value: str
    change: Optional[str] = None
    type: Optional[str] = None # 'positive', 'negative', 'neutral'
