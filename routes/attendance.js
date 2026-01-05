
const express = require("express");
const router = express.Router();
const { markAttendance, getAttendanceByCourse, getAttendancePercentageByCourse } = require("../controllers/attendance");
const authMiddleware = require("../middleware/authentication");


router.post("/:studentId", authMiddleware, markAttendance);
router.get("/course/:courseId", authMiddleware, getAttendanceByCourse);
router.get("/course/:courseId/percentage", authMiddleware, getAttendancePercentageByCourse);


module.exports = router;
