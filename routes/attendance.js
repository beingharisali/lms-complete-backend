
const express = require("express");
const router = express.Router();
const { markAttendance, getAttendanceByCourse, getAttendancePercentageByCourse } = require("../controllers/attendance");
const authMiddleware = require("../middleware/authentication");

// Mark/update attendance
router.post("/:studentId", authMiddleware, markAttendance);

// Get attendance for a course ( frontend status display)
router.get("/course/:courseId", authMiddleware, getAttendanceByCourse);
// percentage of atendance
router.get("/course/:courseId/percentage", authMiddleware, getAttendancePercentageByCourse);


module.exports = router;
