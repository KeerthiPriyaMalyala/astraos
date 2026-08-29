require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("../utils/password");

const admin = {
  name: "AstraOS Admin",
  email: "admin@astraos.com",
  password: "Admin@12345",
  phoneNumber: "9999999999",
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("[AstraOS] MongoDB connected");

    const existingAdmin = await User.findOne({
      email: admin.email,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      console.log(`📧 Email: ${admin.email}`);

      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await hashPassword(admin.password);

    await User.create({
      name: admin.name,
      email: admin.email,
      password: hashedPassword,
      phoneNumber: admin.phoneNumber,
      role: "ADMIN",
      department: null,
      isEmailVerified: true,
      isActive: true,
    });

    console.log("👑 Admin created successfully");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${admin.password}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "❌ Admin seeding failed:",
      error.message
    );

    process.exit(1);
  }
}

seedAdmin();