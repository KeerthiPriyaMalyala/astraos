const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// =====================================================
// PYTHON AI BASE URL
// =====================================================

const PYTHON_AI_URL =
  process.env.PYTHON_AI_URL ||
  "http://127.0.0.1:8000";

// =====================================================
// PYTHON AI HEALTH CHECK
// =====================================================

const checkPythonAIHealth = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_AI_URL}/api/ai/health`,
      {
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[AstraOS AI] Python health check failed:",
      error.message
    );

    throw error;
  }
};

// =====================================================
// PYTHON AI STATUS
// =====================================================

const getPythonAIStatus = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_AI_URL}/api/ai/status`,
      {
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "[AstraOS AI] Python status check failed:",
      error.message
    );

    throw error;
  }
};

// =====================================================
// PYTHON AI VISION
// =====================================================

const analyzeImageWithPythonAI = async (
  filePath,
  originalName
) => {
  try {
    // =================================================
    // 1. VALIDATE FILE PATH
    // =================================================

    if (!filePath) {
      throw new Error(
        "Image file path is required"
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Image file not found: ${filePath}`
      );
    }

    // =================================================
    // 2. GET ORIGINAL FILE EXTENSION
    // =================================================

    const originalExtension =
      path
        .extname(originalName || "")
        .toLowerCase();

    console.log(
      "[AstraOS AI] Stored image:",
      filePath
    );

    console.log(
      "[AstraOS AI] Original filename:",
      originalName
    );

    console.log(
      "[AstraOS AI] Original extension:",
      originalExtension
    );

    // =================================================
    // 3. VALIDATE IMAGE EXTENSION
    // =================================================

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    if (
      !allowedExtensions.includes(
        originalExtension
      )
    ) {
      throw new Error(
        `Unsupported image format: ${
          originalExtension || "unknown"
        }`
      );
    }

    // =================================================
    // 4. CREATE MULTIPART FORM
    // =================================================

    const form = new FormData();

    // =================================================
    // 5. CREATE SAFE PYTHON FILENAME
    // =================================================

    const uploadFilename =
      `astraos_image${originalExtension}`;

    // =================================================
    // 6. DETERMINE MIME TYPE
    // =================================================

    let contentType = "image/jpeg";

    if (
      originalExtension === ".png"
    ) {
      contentType = "image/png";
    }

    if (
      originalExtension === ".webp"
    ) {
      contentType = "image/webp";
    }

    // =================================================
    // 7. ATTACH IMAGE
    // =================================================

    form.append(
      "file",
      fs.createReadStream(filePath),
      {
        filename: uploadFilename,
        contentType,
      }
    );

    // =================================================
    // 8. SEND IMAGE TO PYTHON AI
    // =================================================

    console.log(
      "[AstraOS AI] Sending image to Python AI..."
    );

    const response = await axios.post(
      `${PYTHON_AI_URL}/api/ai/vision`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },

        timeout: 120000,

        maxContentLength: Infinity,

        maxBodyLength: Infinity,
      }
    );

    console.log(
      "[AstraOS AI] Python vision response received"
    );

    return response.data;
  } catch (error) {
    console.error(
      "[AstraOS AI] Vision request failed:",
      error.message
    );

    // =================================================
    // PYTHON ERROR DETAILS
    // =================================================

    if (error.response) {
      console.error(
        "[AstraOS AI] Python status:",
        error.response.status
      );

      console.error(
        "[AstraOS AI] Python response:",
        error.response.data
      );
    }

    throw error;
  }
};

// =====================================================
// PYTHON AI DUPLICATE DETECTION
// =====================================================

const detectDuplicateWithPythonAI = async ({
  title,
  description,
  existingComplaints = [],
}) => {
  try {
    // =================================================
    // 1. VALIDATE INPUT
    // =================================================

    if (!title || !description) {
      throw new Error(
        "Title and description are required"
      );
    }

    // =================================================
    // 2. PREPARE EXISTING COMPLAINTS
    // =================================================

    const complaints =
      existingComplaints.map(
        (complaint) => ({
          id: complaint._id
            ? complaint._id.toString()
            : complaint.id
              ? complaint.id.toString()
              : null,

          title:
            complaint.title || "",

          description:
            complaint.description || "",
        })
      );

    console.log(
      "[AstraOS AI] Sending complaint to Python duplicate detection..."
    );

    console.log(
      `[AstraOS AI] Existing complaints sent: ${complaints.length}`
    );

    // =================================================
    // 3. SEND REQUEST TO PYTHON
    // =================================================

    const response = await axios.post(
      `${PYTHON_AI_URL}/api/ai/duplicate`,
      {
        title,
        description,
        existing_complaints:
          complaints,
      },
      {
        timeout: 30000,

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

    // =================================================
    // 4. VALIDATE PYTHON RESPONSE
    // =================================================

    if (!response.data) {
      throw new Error(
        "Python duplicate detection returned empty response"
      );
    }

    console.log(
      "[AstraOS AI] Python duplicate detection response received"
    );

    // =================================================
    // 5. RETURN PYTHON RESULT
    // =================================================

    return response.data;
  } catch (error) {
    console.error(
      "[AstraOS AI] Duplicate detection request failed:",
      error.message
    );

    // =================================================
    // PYTHON ERROR DETAILS
    // =================================================

    if (error.response) {
      console.error(
        "[AstraOS AI] Python status:",
        error.response.status
      );

      console.error(
        "[AstraOS AI] Python response:",
        error.response.data
      );
    }

    throw error;
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  checkPythonAIHealth,
  getPythonAIStatus,
  analyzeImageWithPythonAI,
  detectDuplicateWithPythonAI,
};