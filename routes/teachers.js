const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  createTeacher,
  getAllTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  uploadFields,
} = require("../controllers/teachers");

// All routes require authentication
router.use(authenticateUser);

// Routes
router.route("/").get(getAllTeachers).post(uploadFields, createTeacher);

router.route("/stats").get(getTeacherStats);

router
  .route("/:id")
  .get(getTeacher)
  .patch(uploadFields, updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
