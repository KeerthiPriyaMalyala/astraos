const express = require("express");

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Current authenticated user
router.get("/me", protect, getCurrentUser);

module.exports = router;