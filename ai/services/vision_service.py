import os
from ultralytics import YOLO


# =====================================================
# ASTRAOS CIVIC VISION SERVICE
# =====================================================

# Current file:
# ai/services/vision_service.py
#
# Therefore:
# BASE_DIR -> ai/
#
# Example:
# ai/
# ├── services/
# │   └── vision_service.py
# ├── runs/
# │   └── detect/
# │       └── astraos_civic_yolo/
# │           └── weights/
# │               └── best.pt
# └── uploads/
#     └── vision/


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


# =====================================================
# YOLO MODEL PATH
# =====================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "runs",
    "detect",
    "astraos_civic_yolo",
    "weights",
    "best.pt"
)


# =====================================================
# ANNOTATED IMAGE OUTPUT DIRECTORY
# =====================================================

OUTPUT_DIR = os.path.join(
    BASE_DIR,
    "uploads",
    "vision",
    "annotated"
)


# =====================================================
# VALIDATE MODEL
# =====================================================

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"AstraOS YOLO model not found at: {MODEL_PATH}"
    )


# =====================================================
# LOAD YOLO MODEL ONCE
# =====================================================

print(
    f"[AstraOS Vision] Loading YOLO model: {MODEL_PATH}"
)

model = YOLO(MODEL_PATH)

print(
    "[AstraOS Vision] YOLO model loaded successfully"
)


# =====================================================
# SEVERITY CALCULATION
# =====================================================

def calculate_severity(
    confidence,
    object_name=""
):
    """
    Convert YOLO confidence into an AstraOS
    civic severity level.

    HIGH   -> confidence >= 0.80
    MEDIUM -> confidence >= 0.50
    LOW    -> confidence < 0.50
    """

    if confidence >= 0.80:

        return "HIGH"

    elif confidence >= 0.50:

        return "MEDIUM"

    return "LOW"


# =====================================================
# OVERALL SEVERITY
# =====================================================

def calculate_overall_severity(
    detections
):
    """
    Determine the highest severity among
    all detected civic problems.
    """

    if not detections:

        return "NONE"


    severity_order = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3
    }


    highest = "LOW"


    for detection in detections:

        current = detection.get(
            "severity",
            "LOW"
        )


        if (
            current in severity_order
            and
            severity_order[current]
            >
            severity_order[highest]
        ):

            highest = current


    return highest


# =====================================================
# IMAGE ANALYSIS
# =====================================================

def analyze_image(
    image_path
):
    """
    Analyze a civic complaint image using
    the trained AstraOS YOLO model.

    Returns:

    {
        "success": True,
        "status": "completed",
        "image": "...",
        "annotated_image": "...",
        "detections": [...],
        "detection_count": 0,
        "overall_severity": "HIGH"
    }
    """

    # =================================================
    # 1. VALIDATE IMAGE PATH
    # =================================================

    if not image_path:

        raise ValueError(
            "Image path is required"
        )


    # =================================================
    # 2. CHECK IMAGE EXISTS
    # =================================================

    if not os.path.exists(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )


    # =================================================
    # 3. CREATE OUTPUT DIRECTORY
    # =================================================

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )


    print(
        f"[AstraOS Vision] Analyzing image: {image_path}"
    )


    # =================================================
    # 4. RUN YOLO
    # =================================================

    results = model(
        image_path,
        conf=0.25
    )


    if not results:

        raise RuntimeError(
            "YOLO returned no results"
        )


    result = results[0]


    # =================================================
    # 5. DETECTION LIST
    # =================================================

    detections = []


    # =================================================
    # 6. EXTRACT DETECTIONS
    # =================================================

    if result.boxes is not None:

        for box in result.boxes:

            # -----------------------------------------
            # CLASS ID
            # -----------------------------------------

            class_id = int(
                box.cls[0]
            )


            # -----------------------------------------
            # CONFIDENCE
            # -----------------------------------------

            confidence = float(
                box.conf[0]
            )


            # -----------------------------------------
            # OBJECT NAME
            # -----------------------------------------

            object_name = model.names.get(
                class_id,
                str(class_id)
            )


            # -----------------------------------------
            # BOUNDING BOX
            # -----------------------------------------

            coordinates = (
                box.xyxy[0]
                .tolist()
            )


            x1, y1, x2, y2 = coordinates


            # -----------------------------------------
            # SEVERITY
            # -----------------------------------------

            severity = calculate_severity(
                confidence,
                object_name
            )


            # -----------------------------------------
            # STORE DETECTION
            # -----------------------------------------

            detections.append({

                "object": object_name,

                "confidence": round(
                    confidence,
                    4
                ),

                "severity": severity,

                "bounding_box": {

                    "x1": round(
                        x1,
                        2
                    ),

                    "y1": round(
                        y1,
                        2
                    ),

                    "x2": round(
                        x2,
                        2
                    ),

                    "y2": round(
                        y2,
                        2
                    )
                }
            })


    # =================================================
    # 7. SAVE ANNOTATED IMAGE
    # =================================================

    original_filename = os.path.basename(
        image_path
    )


    annotated_filename = (
        f"annotated_{original_filename}"
    )


    annotated_path = os.path.join(
        OUTPUT_DIR,
        annotated_filename
    )


    result.save(
        filename=annotated_path
    )


    # =================================================
    # 8. CALCULATE OVERALL SEVERITY
    # =================================================

    overall_severity = (
        calculate_overall_severity(
            detections
        )
    )


    # =================================================
    # 9. LOG RESULT
    # =================================================

    print(
        "[AstraOS Vision] Detection count:",
        len(detections)
    )

    print(
        "[AstraOS Vision] Overall severity:",
        overall_severity
    )

    print(
        "[AstraOS Vision] Annotated image:",
        annotated_path
    )


    # =================================================
    # 10. FINAL AI RESPONSE
    # =================================================

    return {

        "success": True,

        "status": "completed",

        "image": image_path,

        "annotated_image": annotated_path,

        "detections": detections,

        "detection_count": len(
            detections
        ),

        "overall_severity":
            overall_severity
    }