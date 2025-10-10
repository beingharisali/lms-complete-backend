const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/students.js");

// ✅ CRUD routes
router.post("/", upload, createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", upload, updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
