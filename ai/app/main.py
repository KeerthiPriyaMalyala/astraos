from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import health

load_dotenv()

# FastAPI application entrypoint. Future AI modules (YOLOv8, OpenCV, Groq,
# scikit-learn based analysis, etc.) will register their own routers here.
app = FastAPI(title="AstraOS AI Service", version="0.1.0")

client_url = os.getenv("CLIENT_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
