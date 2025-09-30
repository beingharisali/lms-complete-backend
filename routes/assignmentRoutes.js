const express = require("express");
const {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  patchAssignment
} = require("../controllers/assignmentController");
const multer = require("multer");

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({ storage });

// CRUD routes
router.post("/", upload.single("file"), createAssignment);
router.get("/", getAssignments);
router.get("/:id", getAssignment);
router.put("/:id", upload.single("file"), updateAssignment);
router.delete("/:id", deleteAssignment);
router.patch("/:id", upload.single("file"), patchAssignment);

module.exports = router;
