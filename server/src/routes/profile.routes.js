const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
   uploadProfilePhoto,
} = require("../controllers/profile.controller");

const { protect } = require("../middleware/auth.middleware");

const { upload } = require("../middleware/upload.middleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.put("/", protect, updateProfile);

// Change logged-in user's password
router.put("/change-password", protect, changePassword);

// Upload profile photo
router.put(
  "/photo",
  protect,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

module.exports = router;