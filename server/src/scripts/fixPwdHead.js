const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

const mongoose = require("mongoose");

const User = require("../models/User");
const Department = require("../models/Department");
const { hashPassword } = require("../utils/password");

async function fixPwdHead() {
  try {
    // =====================================================
    // 1. CONNECT TO MONGODB
    // =====================================================

    await mongoose.connect(process.env.MONGO_URI);

    console.log("[AstraOS] MongoDB connected");

    // =====================================================
    // 2. FIND PWD DEPARTMENT
    // =====================================================

    const department = await Department.findOne({
      code: "PWD",
      isActive: true,
    });

    if (!department) {
      throw new Error("Public Works Department not found");
    }

    console.log(
      `🏢 PWD Department found: ${department._id}`
    );

    // =====================================================
    // 3. FIND EXISTING PWD HEAD
    // =====================================================

    const user = await User.findOne({
      email: "pwdhead@astraos.com",
    });

    if (!user) {
      throw new Error(
        "pwdhead@astraos.com account not found"
      );
    }

    // =====================================================
    // 4. HASH NEW PASSWORD
    // =====================================================

    const hashedPassword = await hashPassword(
      "PwdHead@12345"
    );

    // =====================================================
    // 5. FIX GOVERNMENT ACCOUNT
    // =====================================================

    user.role = "DEPARTMENT_HEAD";
    user.department = department._id;
    user.password = hashedPassword;
    user.isActive = true;
    user.isEmailVerified = true;

    await user.save();

    // =====================================================
    // 6. SHOW RESULT
    // =====================================================

    console.log("✅ PWD Department Head fixed successfully");

    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👑 Role: ${user.role}`);
    console.log(`🏢 Department: ${department.name}`);
    console.log(`🔑 Password: PwdHead@12345`);

    await mongoose.disconnect();

    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error(
      "❌ Failed to fix PWD Department Head:",
      error.message
    );

    process.exit(1);
  }
}

fixPwdHead();