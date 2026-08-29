const express = require("express");

const {
  getMyRewards,
} = require("../controllers/reward.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// 🏆 CITIZEN REWARD ROUTES
// =====================================================

// GET /api/rewards/me
router.get(
  "/me",
  protect,
  getMyRewards
);

module.exports = router;