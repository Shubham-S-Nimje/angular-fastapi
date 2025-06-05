from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.session import engine
from models.user import Base
from routes import admin, auth
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create the tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # You can add cleanup code here if needed

app = FastAPI(
    title="Portfolio FastAPI",
    description="A scalable REST API using FastAPI.",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api", tags=["admin"])
app.include_router(auth.router, prefix="/api/user", tags=["auth"])