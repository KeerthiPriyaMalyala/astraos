// const express = require("express");
// const cors = require("cors");
// const path = require("path");


// const healthRoutes = require("./routes/health.routes");
// const authRoutes = require("./routes/auth.routes");
// const profileRoutes = require("./routes/profile.routes");
// const complaintRoutes = require("./routes/complaint.routes");
// const aiRoutes = require("./routes/ai.routes");
// const departmentRoutes = require("./routes/department.routes");
// const adminRoutes = require("./routes/admin.routes");
// const officerRoutes = require("./routes/officer.routes");
// const notificationRoutes = require("./routes/notification.routes");

// const rewardRoutes = require("./routes/reward.routes");

// const { notFound, errorHandler } = require("./middleware/errorHandler");

// const app = express();

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Serve uploaded files
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "../uploads"))
// );

// // Serve AI uploaded files
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "../../ai/uploads"))
// );

// app.use("/api/health", healthRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/complaints", complaintRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/officer", officerRoutes);
// app.use(
//   "/api/notifications",
//   notificationRoutes
// );

// app.use(
//   "/api/rewards",
//   rewardRoutes
// );


// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;





//image problemm



const express = require("express");
const cors = require("cors");
const path = require("path");

// =====================================================
// ROUTES
// =====================================================

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const complaintRoutes = require("./routes/complaint.routes");
const aiRoutes = require("./routes/ai.routes");
const departmentRoutes = require("./routes/department.routes");
const adminRoutes = require("./routes/admin.routes");
const officerRoutes = require("./routes/officer.routes");
const notificationRoutes = require("./routes/notification.routes");
const rewardRoutes = require("./routes/reward.routes");

// =====================================================
// ERROR HANDLING
// =====================================================

const {
  notFound,
  errorHandler,
} = require("./middleware/errorHandler");

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// ROOT / SERVER TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AstraOS Backend is running",
  });
});

// =====================================================
// SERVE SERVER UPLOADED FILES
// =====================================================
// Complaint images:
// /uploads/complaints/filename.jpg
//
// Profile images:
// /uploads/profile/filename.jpg
//
// These files are stored inside:
// server/uploads/
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/complaints",
  complaintRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/officer",
  officerRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/rewards",
  rewardRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(notFound);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// EXPORT APP
// =====================================================

module.exports = app;