const express = require("express");

const {
  getMyNotifications,
  getUnreadNotificationCount,
  readNotification,
  readAllNotifications,
} = require("../controllers/notification.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// ALL NOTIFICATION ROUTES REQUIRE LOGIN
// =====================================================

router.use(protect);

// =====================================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================================

router.get(
  "/",
  getMyNotifications
);

// =====================================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// =====================================================

router.get(
  "/unread-count",
  getUnreadNotificationCount
);

// =====================================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================================

router.patch(
  "/read-all",
  readAllNotifications
);

// =====================================================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// =====================================================

router.patch(
  "/:id/read",
  readNotification
);

module.exports = router;