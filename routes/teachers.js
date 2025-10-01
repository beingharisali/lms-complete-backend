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
  getInstructorsList, // ADD THIS LINE
  uploadFields,
} = require("../controllers/teachers");

// All routes require authentication
router.use(authenticateUser);

// Get instructors list for dropdown (must be before /:id route)
router.route("/instructors-list").get(getInstructorsList);

// Statistics route
router.route("/stats").get(getTeacherStats);

// Routes
router.route("/").get(getAllTeachers).post(uploadFields, createTeacher);

router
  .route("/:id")
  .get(getTeacher)
  .patch(uploadFields, updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
