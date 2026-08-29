# =====================================================
# ASTRAOS DUPLICATE DETECTION SERVICE
# =====================================================

from difflib import SequenceMatcher
import re


# =====================================================
# NORMALIZE TEXT
# =====================================================

def normalize_text(text=""):
    """
    Normalize complaint text before comparison.

    Steps:
    - Convert to lowercase
    - Remove special characters
    - Remove extra spaces
    """

    if not text:
        return ""

    text = str(text).lower()

    # Keep letters, numbers and spaces
    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    # Remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# =====================================================
# TEXT SIMILARITY
# =====================================================

def calculate_text_similarity(text1, text2):
    """
    Calculate similarity between two complaint texts.

    Returns:
        float between 0 and 1
    """

    text1 = normalize_text(text1)
    text2 = normalize_text(text2)

    # -------------------------------------------------
    # Empty text
    # -------------------------------------------------

    if not text1 or not text2:
        return 0.0

    # -------------------------------------------------
    # SequenceMatcher similarity
    # -------------------------------------------------

    return SequenceMatcher(
        None,
        text1,
        text2
    ).ratio()


# =====================================================
# DUPLICATE DETECTION
# =====================================================

def detect_duplicate(data):
    """
    AstraOS duplicate complaint detection pipeline.

    Expected input:

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

    Returns:

    {
        "success": True,
        "isDuplicate": True/False,
        "duplicateOf": "...",
        "similarityScore": 0.0,
        "message": "..."
    }
    """

    # =================================================
    # 1. VALIDATE REQUEST
    # =================================================

    if not data:
        return {
            "success": False,
            "isDuplicate": False,
            "duplicateOf": None,
            "similarityScore": 0.0,
            "message": "Complaint data is required."
        }

    # =================================================
    # 2. GET COMPLAINT DATA
    # =================================================

    title = data.get(
        "title",
        ""
    )

    description = data.get(
        "description",
        ""
    )

    existing_complaints = data.get(
        "existing_complaints",
        []
    )

    # =================================================
    # 3. CREATE CURRENT COMPLAINT TEXT
    # =================================================

    current_text = normalize_text(
        f"{title} {description}"
    )

    # =================================================
    # 4. VALIDATE CURRENT COMPLAINT
    # =================================================

    if not current_text:
        return {
            "success": False,
            "isDuplicate": False,
            "duplicateOf": None,
            "similarityScore": 0.0,
            "message": "Complaint title or description is required."
        }

    # =================================================
    # 5. NO EXISTING COMPLAINTS
    # =================================================

    if not existing_complaints:
        return {
            "success": True,
            "isDuplicate": False,
            "duplicateOf": None,
            "similarityScore": 0.0,
            "message": "No existing complaints available for comparison."
        }

    # =================================================
    # 6. FIND MOST SIMILAR COMPLAINT
    # =================================================

    highest_similarity = 0.0

    duplicate_id = None

    for complaint in existing_complaints:

        if not complaint:
            continue

        # -------------------------------------------------
        # Existing complaint ID
        # -------------------------------------------------

        complaint_id = complaint.get(
            "id"
        )

        # -------------------------------------------------
        # Existing complaint title
        # -------------------------------------------------

        existing_title = complaint.get(
            "title",
            ""
        )

        # -------------------------------------------------
        # Existing complaint description
        # -------------------------------------------------

        existing_description = complaint.get(
            "description",
            ""
        )

        # -------------------------------------------------
        # Combine existing complaint text
        # -------------------------------------------------

        existing_text = normalize_text(
            f"{existing_title} {existing_description}"
        )

        # -------------------------------------------------
        # Skip empty complaints
        # -------------------------------------------------

        if not existing_text:
            continue

        # -------------------------------------------------
        # Calculate similarity
        # -------------------------------------------------

        similarity = calculate_text_similarity(
            current_text,
            existing_text
        )

        # -------------------------------------------------
        # Keep highest similarity
        # -------------------------------------------------

        if similarity > highest_similarity:

            highest_similarity = similarity

            duplicate_id = complaint_id

    # =================================================
    # 7. DUPLICATE THRESHOLD
    # =================================================

    DUPLICATE_THRESHOLD = 0.75

    # =================================================
    # 8. CHECK DUPLICATE
    # =================================================

    is_duplicate = (
        highest_similarity >= DUPLICATE_THRESHOLD
        and duplicate_id is not None
    )

    # =================================================
    # 9. ROUND SIMILARITY
    # =================================================

    rounded_similarity = round(
        highest_similarity,
        3
    )

    # =================================================
    # 10. DUPLICATE FOUND
    # =================================================

    if is_duplicate:

        return {
            "success": True,

            "isDuplicate": True,

            "duplicateOf": duplicate_id,

            "similarityScore": rounded_similarity,

            "message":
                "A similar complaint was already reported."
        }

    # =================================================
    # 11. NO DUPLICATE
    # =================================================

    return {
        "success": True,

        "isDuplicate": False,

        "duplicateOf": None,

        "similarityScore": rounded_similarity,

        "message":
            "No duplicate complaint detected."
    }