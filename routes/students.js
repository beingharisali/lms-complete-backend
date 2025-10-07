// const express = require("express");
// const router = express.Router();
// const authenticateUser = require("../middleware/authentication");

// const {
//   createStudent,
//   getAllStudents,
//   getStudent,
//   updateStudent,
//   deleteStudent,
//   getStudentStats,
//   uploadFields,
// } = require("../controllers/students");

// // All routes require authentication
// router.use(authenticateUser);

// // Routes
// router.route("/").get(getAllStudents).post(uploadFields, createStudent);

// router.route("/stats").get(getStudentStats);

// router
//   .route("/:id")
//   .get(getStudent)
//   .patch(uploadFields, updateStudent)
//   .delete(deleteStudent);

// module.exports = router;

 

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createStudent,
  getStudents,
  getStudentById,
  // updateStudent,
  deleteStudent,
} = require("../controllers/students.js");


// ✅ CRUD routes
router.post("/", upload, createStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
// router.put("/:id", upload, updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
