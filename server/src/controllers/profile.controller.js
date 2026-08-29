const User = require("../models/User");
const bcrypt = require("bcrypt");

// Remove sensitive fields before sending user data
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
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    // protect middleware already authenticated the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phoneNumber,
      state,
      district,
      city,
      ward,
      address,
      preferredLanguage,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      user.phoneNumber = phoneNumber.trim();
    }

    if (state !== undefined) {
      user.state = state.trim();
    }

    if (district !== undefined) {
      user.district = district.trim();
    }

    if (city !== undefined) {
      user.city = city.trim();
    }

    if (ward !== undefined) {
      user.ward = ward.trim();
    }

    if (address !== undefined) {
      user.address = address.trim();
    }

    if (preferredLanguage !== undefined) {
      user.preferredLanguage = preferredLanguage.trim();
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: sanitizeUser(updatedUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
user.password = hashedNewPassword;

await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile/photo
const uploadProfilePhoto = async (req, res, next) => {
  try {
    // Check whether an image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store the relative path in MongoDB
    user.profilePhoto = `/uploads/profile/${req.file.filename}`;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        user: sanitizeUser(updatedUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
    uploadProfilePhoto,
};