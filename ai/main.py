from fastapi import FastAPI

from routes.ai_routes import router


# =====================================================
# ASTRAOS AI APPLICATION
# =====================================================

app = FastAPI(
    title="AstraOS AI Engine",
    description="AI intelligence service for AstraOS",
    version="1.0.0"
)


# =====================================================
# AI ROUTES
# =====================================================

app.include_router(
    router,
    prefix="/api/ai"
)


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {
        "success": True,
        "service": "AstraOS AI Engine",
        "status": "running"
    }


# =====================================================
# GENERAL HEALTH
# =====================================================

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "AI",
        "status": "healthy"
    }