const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn(
        "[AstraOS] MONGO_URI is not set — skipping database connection for now."
      );
      return;
    }

    await mongoose.connect(mongoURI);

    console.log("[AstraOS] MongoDB connected");
  } catch (error) {
    console.error("[AstraOS] MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;