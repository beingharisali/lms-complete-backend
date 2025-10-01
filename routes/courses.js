const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getMyCoursesAsTeacher,
  uploadCourseImage,
} = require("../controllers/courses");

// All routes require authentication
router.use(authenticateUser);

// Statistics route (ADMIN ONLY)
router.route("/stats").get(getCourseStats);

// Teacher's own courses (TEACHER ONLY)
router.route("/my-courses").get(getMyCoursesAsTeacher);

// Main CRUD routes
router
  .route("/")
  .get(getAllCourses) // Admin sees all, Teacher sees only their own
  .post(uploadCourseImage, createCourse); // ADMIN ONLY

router
  .route("/:id")
  .get(getCourse) // Admin sees any, Teacher sees only their own
  .patch(uploadCourseImage, updateCourse) // ADMIN ONLY
  .delete(deleteCourse); // ADMIN ONLY

module.exports = router;
