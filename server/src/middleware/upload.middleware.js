const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// UPLOAD DIRECTORIES
// =====================================================

const profileUploadDirectory = path.join(
  __dirname,
  "../../uploads/profile"
);

const complaintUploadDirectory = path.join(
  __dirname,
  "../../uploads/complaints"
);

// =====================================================
// CREATE DIRECTORIES IF THEY DON'T EXIST
// =====================================================

if (!fs.existsSync(profileUploadDirectory)) {
  fs.mkdirSync(profileUploadDirectory, {
    recursive: true,
  });
}

if (!fs.existsSync(complaintUploadDirectory)) {
  fs.mkdirSync(complaintUploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// PROFILE STORAGE
// =====================================================

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `profile-${req.user._id}-${Date.now()}${extension}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// COMPLAINT IMAGE STORAGE
// =====================================================

const complaintStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, complaintUploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const uniqueName = `complaint-${req.user._id}-${Date.now()}${extension}`;

    cb(null, uniqueName);
  },
});

// =====================================================
// IMAGE FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP images are allowed"
      ),
      false
    );
  }
};

// =====================================================
// PROFILE UPLOAD
// =====================================================

const upload = multer({
  storage: profileStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

// =====================================================
// COMPLAINT IMAGE UPLOAD
// =====================================================

const complaintUpload = multer({
  storage: complaintStorage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  upload,
  complaintUpload,
};