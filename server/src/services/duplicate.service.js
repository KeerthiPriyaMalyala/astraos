const Complaint = require("../models/Complaint");

const {
  detectDuplicateWithPythonAI,
} = require("./ai/pythonAI.service");

// =====================================================
// DETECT DUPLICATE COMPLAINT
// =====================================================
// Node.js is responsible for:
// 1. Fetching existing complaints from MongoDB
// 2. Filtering them by category/status
// 3. Sending them to Python AI
// 4. Returning a normalized duplicate result
//
// Python AI is responsible for:
// - Calculating text similarity
// - Finding the most similar complaint
// - Deciding whether it is a duplicate
// =====================================================

const detectDuplicateComplaint = async ({
  title,
  description,
  category,
  complaintId,
}) => {
  try {
    // =================================================
    // 1. BASIC VALIDATION
    // =================================================

    if (!title || !description || !category) {
      return {
        isDuplicate: false,
        duplicateOf: null,
        similarityScore: null,
      };
    }

    // =================================================
    // 2. FIND EXISTING COMPLAINTS
    // =================================================
    // We keep database access inside Node.js.
    // Python AI does not directly access MongoDB.
    // =================================================

    const existingComplaints =
      await Complaint.find({
        // Never compare the complaint with itself
        _id: {
          $ne: complaintId,
        },

        // Compare complaints from the same category
        category,

        // Do not compare against completely closed complaints
        status: {
          $nin: ["CLOSED"],
        },
      })
        .select(
          "_id title description category createdAt status"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100);

    // =================================================
    // 3. NO EXISTING COMPLAINTS
    // =================================================

    if (!existingComplaints.length) {
      console.log(
        "[AstraOS Duplicate] No existing complaints available"
      );

      return {
        isDuplicate: false,
        duplicateOf: null,
        similarityScore: null,
      };
    }

    // =================================================
    // 4. SEND COMPLAINTS TO PYTHON AI
    // =================================================

    console.log(
      `[AstraOS Duplicate] Comparing against ${existingComplaints.length} existing complaints`
    );

    const aiResult =
      await detectDuplicateWithPythonAI({
        title,
        description,
        existingComplaints,
      });

    // =================================================
    // 5. VALIDATE PYTHON RESPONSE
    // =================================================

    if (!aiResult) {
      console.warn(
        "[AstraOS Duplicate] Python AI returned empty response"
      );

      return {
        isDuplicate: false,
        duplicateOf: null,
        similarityScore: null,
      };
    }

    // =================================================
    // 6. NORMALIZE DUPLICATE RESULT
    // =================================================

    const isDuplicate =
      aiResult.isDuplicate === true;

    const duplicateOf =
      aiResult.duplicateOf || null;

    const similarityScore =
      aiResult.similarityScore !== undefined &&
      aiResult.similarityScore !== null
        ? Number(aiResult.similarityScore)
        : null;

    // =================================================
    // 7. DUPLICATE FOUND
    // =================================================

    if (isDuplicate && duplicateOf) {
      console.log(
        `[AstraOS Duplicate] Duplicate found → ${duplicateOf}`
      );

      console.log(
        `[AstraOS Duplicate] Similarity → ${
          similarityScore !== null
            ? `${Math.round(
                similarityScore * 100
              )}%`
            : "unknown"
        }`
      );

      return {
        isDuplicate: true,
        duplicateOf,
        similarityScore,
      };
    }

    // =================================================
    // 8. NO DUPLICATE FOUND
    // =================================================

    console.log(
      `[AstraOS Duplicate] No duplicate detected${
        similarityScore !== null
          ? ` (best similarity: ${Math.round(
              similarityScore * 100
            )}%)`
          : ""
      }`
    );

    return {
      isDuplicate: false,
      duplicateOf: null,
      similarityScore,
    };
  } catch (error) {
    // =================================================
    // IMPORTANT
    // =================================================
    // Duplicate detection must NEVER stop a citizen
    // from submitting a complaint.
    //
    // If Python AI is unavailable or fails,
    // complaint creation continues normally.
    // =================================================

    console.error(
      "[AstraOS Duplicate] Detection failed:",
      error.message
    );

    return {
      isDuplicate: false,
      duplicateOf: null,
      similarityScore: null,
    };
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  detectDuplicateComplaint,
};