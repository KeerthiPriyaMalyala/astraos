// =====================================================
// ASTRAOS PRIORITY ENGINE
// =====================================================

const calculatePriority = (complaint) => {
  let score = 0;
  const reasons = [];

  // =====================================================
  // 1. AI SEVERITY
  // Maximum: 50 points
  // =====================================================

  const severity = complaint.aiAnalysis?.severity;

  if (typeof severity === "number") {
    const severityScore = Math.round(
      (severity / 10) * 50
    );

    score += severityScore;

    reasons.push(
      `AI severity ${severity}/10 contributed ${severityScore} points`
    );
  }

  // =====================================================
  // 2. VISION AI SEVERITY
  // Maximum: 20 points
  //
  // Vision AI detects the actual civic issue from the
  // uploaded image.
  //
  // HIGH / CRITICAL visual severity should increase
  // complaint priority.
  // =====================================================

  const visionSeverity =
    complaint.visionAnalysis?.overallSeverity;

  if (visionSeverity) {
    let visionScore = 0;

    switch (
      visionSeverity.toUpperCase()
    ) {
      case "CRITICAL":
        visionScore = 20;
        break;

      case "HIGH":
        visionScore = 15;
        break;

      case "MEDIUM":
        visionScore = 8;
        break;

      case "LOW":
        visionScore = 3;
        break;

      default:
        visionScore = 0;
        break;
    }

    if (visionScore > 0) {
      score += visionScore;

      reasons.push(
        `Vision AI detected ${visionSeverity} severity and contributed ${visionScore} points`
      );
    }
  }

  // =====================================================
  // 3. EMERGENCY CATEGORY
  // Maximum: 20 points
  // =====================================================

  const category =
    complaint.aiAnalysis?.category ||
    complaint.category;

  if (category === "EMERGENCY") {
    score += 20;

    reasons.push(
      "Emergency category detected"
    );
  }

  // =====================================================
  // 4. IMPORTANT LOCATION
  // Maximum: 15 points
  // =====================================================

  const landmark =
    complaint.location?.landmark?.toLowerCase() ||
    "";

  const address =
    complaint.location?.address?.toLowerCase() ||
    "";

  const locationText =
    `${landmark} ${address}`;

  const importantPlaces = [
    "school",
    "hospital",
    "college",
    "clinic",
    "fire station",
    "police station",
  ];

  const hasImportantLocation =
    importantPlaces.some(
      (place) =>
        locationText.includes(place)
    );

  if (hasImportantLocation) {
    score += 15;

    reasons.push(
      "Complaint is associated with an important public location"
    );
  }

  // =====================================================
  // 5. DUPLICATE REPORT
  // Maximum: 10 points
  // =====================================================

  if (
    complaint.duplicateInfo?.isDuplicate
  ) {
    score += 10;

    reasons.push(
      "Similar complaint has already been reported"
    );
  }

  // =====================================================
  // 6. AI CONFIDENCE
  // Maximum: 5 points
  // =====================================================

  const confidence =
    complaint.aiAnalysis?.confidence;

  if (typeof confidence === "number") {
    const confidenceScore =
      Math.round(confidence * 5);

    score += confidenceScore;

    reasons.push(
      `AI confidence contributed ${confidenceScore} points`
    );
  }

  // =====================================================
  // KEEP SCORE BETWEEN 0 AND 100
  // =====================================================

  score = Math.min(
    100,
    Math.max(0, score)
  );

  // =====================================================
  // DETERMINE PRIORITY LEVEL
  // =====================================================

  let level = "LOW";

  if (score >= 81) {
    level = "CRITICAL";
  } else if (score >= 61) {
    level = "HIGH";
  } else if (score >= 31) {
    level = "MEDIUM";
  }

  // =====================================================
  // BUILD REASON
  // =====================================================

  const reason =
    reasons.length > 0
      ? reasons.join(". ") + "."
      : "No priority factors detected.";

  // =====================================================
  // RETURN PRIORITY
  // =====================================================

  return {
    level,
    score,
    reason,
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  calculatePriority,
};