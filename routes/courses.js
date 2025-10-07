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

router.use(authenticateUser);

router.route("/stats").get(getCourseStats);

router.route("/my-courses").get(getMyCoursesAsTeacher);

router.route("/").get(getAllCourses).post(uploadCourseImage, createCourse);

router
  .route("/:id")
  .get(getCourse)
  .patch(uploadCourseImage, updateCourse)
  .delete(deleteCourse);

module.exports = router;
