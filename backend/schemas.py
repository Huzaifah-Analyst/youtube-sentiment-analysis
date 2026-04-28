from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime
    is_admin: bool = False
    is_verified: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendCodeRequest(BaseModel):
    email: EmailStr

class AnalysisHistoryOut(BaseModel):
    id: str
    video_url: str
    video_title: str
    results_json: str
    analyzed_at: datetime

    class Config:
        from_attributes = True

class AdminUserOut(BaseModel):
    id: str
    email: str
    created_at: datetime
    is_admin: bool
    analysis_count: int

    class Config:
        from_attributes = True
