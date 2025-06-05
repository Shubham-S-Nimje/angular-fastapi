from pydantic import BaseModel, create_model, EmailStr
from uuid import UUID
from typing import Optional
from enum import Enum

def create_dynamic_model(name: str, fields: dict):
    return create_model(name, **fields)

class UserType(str, Enum):
    admin = "admin"
    user = "user"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    user_type: UserType = UserType.user
  
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    user_type: UserType
    access_token: Optional[str] = None
    token_type: Optional[str] = None

    class Config:
        from_attributes = True
