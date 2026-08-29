import os
from dotenv import load_dotenv

load_dotenv(".env")


AI_PORT = int(os.getenv("AI_PORT", 8000))

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

NODE_BACKEND_URL = os.getenv(
    "NODE_BACKEND_URL",
    "http://localhost:5000"
)