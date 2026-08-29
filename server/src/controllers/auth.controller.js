const User = require("../models/User");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password");
const { generateToken } = require("../utils/jwt");

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profilePhoto: user.profilePhoto,

    state: user.state,
    district: user.district,
    city: user.city,
    ward: user.ward,
    address: user.address,

    preferredLanguage: user.preferredLanguage,

    // 🔐 Role
    role: user.role,

    // 🏢 Department
    department: user.department || null,

    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * @desc    Register a new citizen
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      profilePhoto,
      state,
      district,
      city,
      ward,
      address,
      preferredLanguage,
    } = req.body;

    // Basic required-field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // IMPORTANT:
    // Public registration always creates a CITIZEN.
    // We intentionally do NOT accept role from req.body.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      profilePhoto,
      state,
      district,
      city,
      ward,
      address,
      preferredLanguage: preferredLanguage || "English",
      role: "CITIZEN",
    });

    // Generate JWT
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate-key race condition safely
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password has select:false in User model,
    // so explicitly include it for authentication.
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // Generic error prevents revealing whether the email exists.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Compare entered password with bcrypt hash
    const passwordMatches = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // protect middleware already verified the token
    // and attached the user to req.user.
    return res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: {
        user: sanitizeUser(req.user),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};