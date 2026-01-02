const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  status: { type: String, enum: ["Present", "Absent", "Online"], required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
