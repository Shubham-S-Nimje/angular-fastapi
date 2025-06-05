from sqlalchemy import Column, String, Enum as SQLEnum
from sqlalchemy.dialects.mysql import CHAR
from uuid import uuid4
from db.session import Base
import enum

class UserType(str, enum.Enum):
    admin = "admin"
    user = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password = Column(String(255), nullable=True)
    user_type = Column(SQLEnum(UserType), nullable=False)
    auth_provider = Column(String(50), nullable=True, default="local")