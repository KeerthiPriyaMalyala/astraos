from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.ai_routes import router


app = FastAPI(
    title="AstraOS AI Engine",
    description="AI intelligence service for AstraOS",
    version="1.0.0"
)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(
    router,
    prefix="/api/ai"
)


@app.get("/")
def root():
    return {
        "success": True,
        "service": "AstraOS AI Engine",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "AI",
        "status": "healthy"
    }