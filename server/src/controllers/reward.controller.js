const {
  getRewardSummary,
} = require("../services/reward.service");

// =====================================================
// 🏆 GET MY REWARD SUMMARY
// =====================================================

const getMyRewards = async (req, res) => {
  try {
    // -----------------------------------------------
    // AUTHENTICATED CITIZEN
    // -----------------------------------------------

    const citizenId = req.user.id;

    // -----------------------------------------------
    // GET REWARD DATA
    // -----------------------------------------------

    const reward = await getRewardSummary(
      citizenId
    );

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Reward summary fetched successfully",
      data: reward,
    });
  } catch (error) {
    console.error(
      "❌ Get citizen rewards error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reward information",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getMyRewards,
};