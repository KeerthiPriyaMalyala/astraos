const Reward = require("../models/Reward");

// =====================================================
// 🏆 ASTRAOS REWARD CONFIGURATION
// =====================================================

const REWARD_POINTS = {
  COMPLAINT_SUBMITTED: 10,
  AI_ANALYSIS_COMPLETED: 5,
  COMPLAINT_VERIFIED: 25,
  SERVICE_RATED: 10,
  REOPENED_COMPLAINT_RESOLVED: 20,
};

// =====================================================
// 🏅 LEVEL CONFIGURATION
// =====================================================

const LEVELS = [
  {
    name: "CIVIC_STARTER",
    minPoints: 0,
  },
  {
    name: "CIVIC_CONTRIBUTOR",
    minPoints: 50,
  },
  {
    name: "COMMUNITY_CHAMPION",
    minPoints: 150,
  },
  {
    name: "CIVIC_GUARDIAN",
    minPoints: 300,
  },
  {
    name: "CIVIC_LEADER",
    minPoints: 500,
  },
];

// =====================================================
// 🥇 BADGE CONFIGURATION
// =====================================================

const BADGES = {
  FIRST_REPORT: {
    points: 10,
    description: "Submitted your first civic complaint.",
  },

  CIVIC_PARTICIPANT: {
    points: 50,
    description: "Earned 50 civic points.",
  },

  ISSUE_VERIFIER: {
    points: 25,
    description: "Verified a resolved civic issue.",
  },

  FEEDBACK_CHAMPION: {
    points: 10,
    description: "Provided service feedback.",
  },

  CIVIC_STREAK: {
    points: 0,
    description: "Maintained a civic activity streak.",
  },

  COMMUNITY_CHAMPION: {
    points: 0,
    description: "Reached Community Champion level.",
  },

  CIVIC_GUARDIAN: {
    points: 0,
    description: "Reached Civic Guardian level.",
  },

  CIVIC_LEADER: {
    points: 0,
    description: "Reached Civic Leader level.",
  },
};

// =====================================================
// 🧠 CALCULATE LEVEL
// =====================================================

const calculateLevel = (points) => {
  let currentLevel = "CIVIC_STARTER";

  for (const level of LEVELS) {
    if (points >= level.minPoints) {
      currentLevel = level.name;
    }
  }

  return currentLevel;
};

// =====================================================
// 🔥 UPDATE STREAK
// =====================================================

const updateStreak = (reward) => {
  const now = new Date();

  if (!reward.lastActivityAt) {
    reward.currentStreak = 1;
    reward.longestStreak = 1;
    reward.lastActivityAt = now;

    return;
  }

  const lastActivity = new Date(
    reward.lastActivityAt
  );

  const difference =
    now.getTime() - lastActivity.getTime();

  const daysDifference =
    difference / (1000 * 60 * 60 * 24);

  // Same day → do not increase streak
  if (daysDifference < 1) {
    reward.lastActivityAt = now;
    return;
  }

  // Consecutive day
  if (daysDifference < 2) {
    reward.currentStreak += 1;
  } else {
    // Streak broken
    reward.currentStreak = 1;
  }

  if (
    reward.currentStreak >
    reward.longestStreak
  ) {
    reward.longestStreak =
      reward.currentStreak;
  }

  reward.lastActivityAt = now;
};

// =====================================================
// 🏅 CHECK BADGES
// =====================================================

const updateBadges = (reward) => {
  const earnedBadges = [];

  // -----------------------------------------------
  // FIRST REPORT
  // -----------------------------------------------

  const complaintCount =
    reward.transactions.filter(
      (transaction) =>
        transaction.action ===
        "COMPLAINT_SUBMITTED"
    ).length;

  if (
    complaintCount >= 1 &&
    !reward.badges.includes("FIRST_REPORT")
  ) {
    reward.badges.push("FIRST_REPORT");

    earnedBadges.push("FIRST_REPORT");
  }

  // -----------------------------------------------
  // CIVIC PARTICIPANT
  // -----------------------------------------------

  if (
    reward.totalPoints >= 50 &&
    !reward.badges.includes(
      "CIVIC_PARTICIPANT"
    )
  ) {
    reward.badges.push(
      "CIVIC_PARTICIPANT"
    );

    earnedBadges.push(
      "CIVIC_PARTICIPANT"
    );
  }

  // -----------------------------------------------
  // ISSUE VERIFIER
  // -----------------------------------------------

  const verificationCount =
    reward.transactions.filter(
      (transaction) =>
        transaction.action ===
        "COMPLAINT_VERIFIED"
    ).length;

  if (
    verificationCount >= 1 &&
    !reward.badges.includes(
      "ISSUE_VERIFIER"
    )
  ) {
    reward.badges.push("ISSUE_VERIFIER");

    earnedBadges.push(
      "ISSUE_VERIFIER"
    );
  }

  // -----------------------------------------------
  // FEEDBACK CHAMPION
  // -----------------------------------------------

  const ratingCount =
    reward.transactions.filter(
      (transaction) =>
        transaction.action ===
        "SERVICE_RATED"
    ).length;

  if (
    ratingCount >= 1 &&
    !reward.badges.includes(
      "FEEDBACK_CHAMPION"
    )
  ) {
    reward.badges.push(
      "FEEDBACK_CHAMPION"
    );

    earnedBadges.push(
      "FEEDBACK_CHAMPION"
    );
  }

  // -----------------------------------------------
  // CIVIC STREAK
  // -----------------------------------------------

  if (
    reward.currentStreak >= 3 &&
    !reward.badges.includes(
      "CIVIC_STREAK"
    )
  ) {
    reward.badges.push(
      "CIVIC_STREAK"
    );

    earnedBadges.push(
      "CIVIC_STREAK"
    );
  }

  // -----------------------------------------------
  // LEVEL BADGES
  // -----------------------------------------------

  if (
    reward.level ===
      "COMMUNITY_CHAMPION" &&
    !reward.badges.includes(
      "COMMUNITY_CHAMPION"
    )
  ) {
    reward.badges.push(
      "COMMUNITY_CHAMPION"
    );

    earnedBadges.push(
      "COMMUNITY_CHAMPION"
    );
  }

  if (
    reward.level ===
      "CIVIC_GUARDIAN" &&
    !reward.badges.includes(
      "CIVIC_GUARDIAN"
    )
  ) {
    reward.badges.push(
      "CIVIC_GUARDIAN"
    );

    earnedBadges.push(
      "CIVIC_GUARDIAN"
    );
  }

  if (
    reward.level ===
      "CIVIC_LEADER" &&
    !reward.badges.includes(
      "CIVIC_LEADER"
    )
  ) {
    reward.badges.push(
      "CIVIC_LEADER"
    );

    earnedBadges.push(
      "CIVIC_LEADER"
    );
  }

  return earnedBadges;
};

// =====================================================
// ⭐ GET OR CREATE REWARD PROFILE
// =====================================================

const getOrCreateReward = async (
  citizenId
) => {
  let reward = await Reward.findOne({
    citizen: citizenId,
  });

  if (!reward) {
    reward = await Reward.create({
      citizen: citizenId,
    });
  }

  return reward;
};

// =====================================================
// ⭐ ADD REWARD POINTS
// =====================================================

const addRewardPoints = async ({
  citizenId,
  action,
  complaintId = null,
  description = "",
}) => {
  if (!citizenId) {
    throw new Error(
      "Citizen ID is required for reward"
    );
  }

  if (!REWARD_POINTS[action]) {
    throw new Error(
      `Invalid reward action: ${action}`
    );
  }

  const points = REWARD_POINTS[action];

  const reward =
    await getOrCreateReward(citizenId);

  // =================================================
  // 🛡️ DUPLICATE PROTECTION
  // =================================================

  const alreadyRewarded =
    reward.transactions.some(
      (transaction) =>
        transaction.action === action &&
        complaintId &&
        transaction.complaint &&
        transaction.complaint.toString() ===
          complaintId.toString()
    );

  if (alreadyRewarded) {
    return {
      reward,
      pointsAdded: 0,
      duplicate: true,
      earnedBadges: [],
    };
  }

  // =================================================
  // ⭐ ADD POINTS
  // =================================================

  reward.totalPoints += points;

  // =================================================
  // 🔥 UPDATE STREAK
  // =================================================

  updateStreak(reward);

  // =================================================
  // 🏆 UPDATE LEVEL
  // =================================================

  reward.level = calculateLevel(
    reward.totalPoints
  );

  // =================================================
  // 📜 TRANSACTION
  // =================================================

  reward.transactions.push({
    citizen: citizenId,
    complaint: complaintId,
    action,
    points,
    description:
      description ||
      getDefaultDescription(action),
  });

  // =================================================
  // 🥇 BADGES
  // =================================================

  const earnedBadges =
    updateBadges(reward);

  // =================================================
  // 💾 SAVE
  // =================================================

  await reward.save();

  return {
    reward,
    pointsAdded: points,
    duplicate: false,
    earnedBadges,
  };
};

// =====================================================
// 📝 DEFAULT DESCRIPTIONS
// =====================================================

const getDefaultDescription = (
  action
) => {
  switch (action) {
    case "COMPLAINT_SUBMITTED":
      return "Submitted a civic complaint.";

    case "AI_ANALYSIS_COMPLETED":
      return "Complaint successfully processed by AstraOS AI.";

    case "COMPLAINT_VERIFIED":
      return "Verified that a civic issue was resolved.";

    case "SERVICE_RATED":
      return "Provided feedback on a civic service.";

    case "REOPENED_COMPLAINT_RESOLVED":
      return "Confirmed resolution of a reopened civic issue.";

    default:
      return "Civic contribution recorded.";
  }
};

// =====================================================
// 📊 GET CITIZEN REWARD SUMMARY
// =====================================================

const getRewardSummary = async (
  citizenId
) => {
  const reward =
    await getOrCreateReward(citizenId);

  return {
    totalPoints: reward.totalPoints,

    level: reward.level,

    currentStreak:
      reward.currentStreak,

    longestStreak:
      reward.longestStreak,

    badges: reward.badges,

    recentTransactions:
      reward.transactions
        .slice(-10)
        .reverse(),
  };
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  addRewardPoints,
  getRewardSummary,
  getOrCreateReward,
  calculateLevel,
  REWARD_POINTS,
};