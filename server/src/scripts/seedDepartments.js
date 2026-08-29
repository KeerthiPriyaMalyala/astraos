require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const Department = require("../models/Department");

const departments = [
  {
    name: "Public Works Department",
    code: "PWD",
    description: "Roads, drainage and public infrastructure",
  },
  {
    name: "Water Department",
    code: "WATER",
    description: "Water supply and water-related issues",
  },
  {
    name: "Electricity Department",
    code: "ELECTRICITY",
    description: "Streetlights and electricity infrastructure",
  },
  {
    name: "Traffic Department",
    code: "TRAFFIC",
    description: "Traffic management and road safety",
  },
  {
    name: "Sanitation Department",
    code: "SANITATION",
    description: "Garbage and sanitation management",
  },
  {
    name: "Environment Department",
    code: "ENVIRONMENT",
    description: "Environmental issues and protection",
  },
  {
    name: "Animal Welfare Department",
    code: "ANIMAL",
    description: "Stray and animal-related civic issues",
  },
  {
    name: "Emergency Management Department",
    code: "EMERGENCY",
    description: "Critical and emergency incidents",
  },
];

async function seedDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("[AstraOS] MongoDB connected");

    for (const department of departments) {
      await Department.findOneAndUpdate(
        { code: department.code },
        department,
        {
          upsert: true,
          new: true,
        }
      );

      console.log(`🏢 Seeded: ${department.name}`);
    }

    console.log("✅ Departments seeded successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "❌ Department seeding failed:",
      error.message
    );

    process.exit(1);
  }
}

seedDepartments();