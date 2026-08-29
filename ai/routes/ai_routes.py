from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

import os
import shutil

from services.vision_service import analyze_image
from services.duplicate_service import detect_duplicate


# =====================================================
# ROUTER
# =====================================================

router = APIRouter()


# =====================================================
# AI HEALTH
# GET /api/ai/health
# =====================================================

@router.get("/health")
def ai_health():

    return {
        "success": True,
        "message": "AstraOS AI service is working"
    }


# =====================================================
# AI STATUS
# GET /api/ai/status
# =====================================================

@router.get("/status")
def ai_status():

    return {
        "success": True,
        "service": "AstraOS AI Center",

        "modules": {
            "vision": "ready",
            "nlp": "pending",
            "priority": "pending",
            "duplicate_detection": "ready"
        }
    }


# =====================================================
# VISION - IMAGE ANALYSIS
# POST /api/ai/vision
# =====================================================

@router.post("/vision")
async def analyze_vision(
    file: UploadFile = File(...)
):
    """
    Upload a civic complaint image and analyze it
    using the trained AstraOS YOLO model.
    """

    # =================================================
    # 1. VALIDATE FILE
    # =================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No image file provided"
        )

    # =================================================
    # 2. ALLOWED IMAGE EXTENSIONS
    # =================================================

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG and WEBP "
                "images are supported"
            )
        )

    # =================================================
    # 3. CREATE UPLOAD DIRECTORY
    # =================================================

    upload_dir = "uploads/vision"

    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    # =================================================
    # 4. CREATE SAFE FILE NAME
    # =================================================

    safe_filename = os.path.basename(
        file.filename
    )

    file_path = os.path.join(
        upload_dir,
        safe_filename
    )

    # =================================================
    # 5. SAVE IMAGE
    # =================================================

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        print(
            "[AstraOS AI] Image uploaded:",
            file_path
        )

        # =================================================
        # 6. RUN YOLO VISION ANALYSIS
        # =================================================

        result = analyze_image(
            file_path
        )

        # =================================================
        # 7. CONVERT ANNOTATED IMAGE PATH
        # =================================================

        if result.get(
            "annotated_image"
        ):

            annotated_path = (
                result["annotated_image"]
            )

            result["annotated_image"] = (
                os.path.relpath(
                    annotated_path
                )
            )

        # =================================================
        # 8. RETURN VISION RESULT
        # =================================================

        return result

    except HTTPException:

        raise

    except Exception as error:

        print(
            "[AstraOS AI] Vision analysis failed:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Vision analysis failed: "
                f"{str(error)}"
            )
        )

    finally:

        await file.close()


# =====================================================
# DUPLICATE DETECTION
# POST /api/ai/duplicate
# =====================================================

@router.post("/duplicate")
async def detect_duplicate_complaint(
    data: dict
):
    """
    Detect whether a newly submitted complaint
    is similar to an existing complaint.

    Expected request:

    {
        "title": "...",
        "description": "...",
        "existing_complaints": [
            {
                "id": "...",
                "title": "...",
                "description": "..."
            }
        ]
    }
    """

    # =================================================
    # 1. VALIDATE REQUEST BODY
    # =================================================

    if not data:

        raise HTTPException(
            status_code=400,
            detail="Complaint data is required"
        )

    # =================================================
    # 2. GET REQUIRED FIELDS
    # =================================================

    title = data.get(
        "title",
        ""
    )

    description = data.get(
        "description",
        ""
    )

    # =================================================
    # 3. VALIDATE REQUIRED FIELDS
    # =================================================

    if not str(title).strip():

        raise HTTPException(
            status_code=400,
            detail="Title is required"
        )

    if not str(description).strip():

        raise HTTPException(
            status_code=400,
            detail="Description is required"
        )

    # =================================================
    # 4. VALIDATE EXISTING COMPLAINTS
    # =================================================

    existing_complaints = data.get(
        "existing_complaints",
        []
    )

    if not isinstance(
        existing_complaints,
        list
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "existing_complaints "
                "must be an array"
            )
        )

    # =================================================
    # 5. RUN DUPLICATE DETECTION
    # =================================================

    try:

        result = detect_duplicate(
            data
        )

        # =================================================
        # 6. RETURN RESULT
        # =================================================

        return result

    except HTTPException:

        raise

    except Exception as error:

        print(
            "[AstraOS AI] Duplicate detection failed:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Duplicate detection failed: "
                f"{str(error)}"
            )
        )