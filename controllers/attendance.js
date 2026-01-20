
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Lecture = require("../models/Lecture");




const markAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, lectureId, status, date } = req.body;

    const teacherId = req.user.userId; 

    if (!courseId || !lectureId || !status || !date) {
      return res.status(400).json({
        success: false,
        message: "courseId, lectureId, status and date are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      studentId,
      courseId,
      teacherId,
      lectureId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      await existingAttendance.save();

      return res.json({
        success: true,
        message: "Attendance updated",
        attendance: existingAttendance,
      });
    }

    const newAttendance = new Attendance({
      studentId,
      courseId,
      teacherId,
      lectureId,
      status,
      date: attendanceDate,
    });

    await newAttendance.save();

    return res.json({
      success: true,
      message: "Attendance marked",
      attendance: newAttendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, lectureId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query is required",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const filter = { courseId, date: attendanceDate };
    if (lectureId) filter.lectureId = lectureId;

    const attendance = await Attendance.find(filter)
      .populate("studentId", "fullName")
      .populate("lectureId", "lectureNumber lectureDate")
      .sort({ "lectureId.lectureNumber": 1 });

    return res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getAttendancePercentageByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId)
      return res.status(400).json({ success: false, message: "courseId required" });

    // Last 30 days
    const today = new Date();
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    // Fetch records for course + last 30 days
    const records = await Attendance.find({
      courseId,
      date: { $gte: past30Days, $lte: today },
    });

    const studentMap = {};

    records.forEach((r) => {
      const sid = r.studentId.toString();
      if (!studentMap[sid]) studentMap[sid] = { total: 0, attended: 0 };

      studentMap[sid].total += 1;

      if (r.status === "Present" || r.status === "Online") {
        studentMap[sid].attended += 1;
      }
    });

    const percentages = {};
    for (const studentId in studentMap) {
      const { total, attended } = studentMap[studentId];
      percentages[studentId] = total === 0 ? 0 : Math.round((attended / total) * 100);
    }

    return res.json({ success: true, percentages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByCourse,
  getAttendancePercentageByCourse,
};
