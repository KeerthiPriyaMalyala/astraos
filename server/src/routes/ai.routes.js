const express = require("express");
const multer = require("multer");
const fs = require("fs");

const {
  analyzeComplaint,
} = require("../services/ai/groq.service");

const {
  checkPythonAIHealth,
  getPythonAIStatus,
  analyzeImageWithPythonAI,
} = require("../services/ai/pythonAI.service");

const router = express.Router();

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({
  dest: "uploads/ai/",
});

// =====================================================
// GROQ TEXT ANALYSIS
// POST /api/ai/analyze
// =====================================================

router.post(
  "/analyze",
  async (req, res, next) => {
    try {
      const {
        title,
        description,
        category,
        location,
      } = req.body;

      // =================================================
      // VALIDATION
      // =================================================

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message:
            "Title and description are required",
        });
      }

      // =================================================
      // GROQ ANALYSIS
      // =================================================

      const result =
        await analyzeComplaint({
          title,
          description,
          category,
          location,
        });

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,
        message:
          "Complaint analyzed successfully",
        data: {
          analysis: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// PYTHON AI HEALTH
// GET /api/ai/python-health
// =====================================================

router.get(
  "/python-health",
  async (req, res, next) => {
    try {
      const result =
        await checkPythonAIHealth();

      return res.status(200).json({
        success: true,
        message:
          "Python AI service is reachable",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// PYTHON AI STATUS
// GET /api/ai/python-status
// =====================================================

router.get(
  "/python-status",
  async (req, res, next) => {
    try {
      const result =
        await getPythonAIStatus();

      return res.status(200).json({
        success: true,
        message:
          "Python AI status retrieved",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// PYTHON AI VISION
// POST /api/ai/python-vision
// =====================================================

router.post(
  "/python-vision",
  upload.single("file"),

  async (req, res, next) => {
    try {
      // =================================================
      // CHECK IMAGE
      // =================================================

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Image file is required",
        });
      }

      // =================================================
      // SAVE TEMP FILE PATH
      // =================================================

      const filePath = req.file.path;

      try {
        // =================================================
        // SEND IMAGE TO PYTHON AI
        // =================================================

        const result =
          await analyzeImageWithPythonAI(
            filePath,
            req.file.originalname
          );

        // =================================================
        // RESPONSE
        // =================================================

        return res.status(200).json({
          success: true,
          message:
            "Image analyzed successfully by Python AI",
          data: result,
        });
      } finally {
        // =================================================
        // DELETE TEMPORARY MULTER FILE
        // =================================================

        if (
          filePath &&
          fs.existsSync(filePath)
        ) {
          fs.unlinkSync(filePath);

          console.log(
            "[AstraOS AI] Temporary image deleted"
          );
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;