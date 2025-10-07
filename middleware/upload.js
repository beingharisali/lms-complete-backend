// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/students";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "");
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .png, and .pdf files are allowed"));
  }
};

// ✅ Define all expected file field names
const upload = multer({ storage, fileFilter }).fields([
  { name: "photo", maxCount: 1 },
  { name: "studentCnicBForm", maxCount: 1 },
  { name: "parentCnic", maxCount: 1 },
  { name: "medicalRecords", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 1 },
]);

module.exports = upload;
