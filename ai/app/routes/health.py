from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    """Basic liveness check for the AstraOS AI service."""
    return {"success": True, "message": "AstraOS AI service is running"}
