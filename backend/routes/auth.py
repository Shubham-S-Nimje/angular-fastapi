from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin, UserResponse, GoogleAuthRequest
from utils.auth import hash_password, verify_password, create_access_token, verify_google_token
from utils.dependencies import get_current_user
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()

@router.post("/signup", response_model=UserResponse)
def user_register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create new user
    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        user_type=user.user_type
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "user_type": db_user.user_type,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/signin", response_model=UserResponse)
def user_login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(User).filter(User.email == user.email).first()

    # print(f"user: {user}")
    # print(f"db_user.password value: {db_user.password} — type: {type(db_user.password)}")


    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    
    # Verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "user_type": db_user.user_type,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/google", response_model=UserResponse)
def google_auth(google_request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify Google token
    # print(f"google_request.token: {google_request.token}")
    google_user_info = verify_google_token(google_request.token)
    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    
    email = google_user_info.get("email")
    name = google_user_info.get("name")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        # User exists, log them in
        access_token = create_access_token(data={"sub": existing_user.email})
        return {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
            "user_type": existing_user.user_type,
            "access_token": access_token,
            "token_type": "bearer"
        }
    else:
        # User doesn't exist, create new account
        db_user = User(
            name=name,
            email=email,
            password=None,  # No password for Google users
            user_type="user",  # Default to user type
            auth_provider="google"
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create access token
        access_token = create_access_token(data={"sub": db_user.email})
        
        return {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "user_type": db_user.user_type,
            "access_token": access_token,
            "token_type": "bearer"
        }