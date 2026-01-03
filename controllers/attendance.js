
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");


  //  MARK / UPDATE ATTENDANCE

const markAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, status, date } = req.body;

    // Teacher ID JWT se
    const teacherId = req.user.userId;

    // Required fields check
    if (!courseId || !status || !date) {
      return res.status(400).json({
        success: false,
        message: "courseId, status and date are required",
      });
    }

    // Student exist karta hai ya nahi
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Date ko midnight pe set karna (date-wise record)
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Same student + course + date ka record check
    const existingAttendance = await Attendance.findOne({
      studentId,
      courseId,
      teacherId,
      date: attendanceDate,
    });

    // Agar record mil jaye --- update
    if (existingAttendance) {
      existingAttendance.status = status;
      await existingAttendance.save();

      return res.json({
        success: true,
        message: "Attendance updated",
        attendance: existingAttendance,
      });
    }

    // Agar record na ho --- new entry
    const newAttendance = new Attendance({
      studentId,
      courseId,
      teacherId,
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  //   attendance (COURSE + DATE)

const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;

    // Date required
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "date query is required",
      });
    }

    // Date normalize
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Course + date ka data
    const attendance = await Attendance.find({
      courseId,
      date: attendanceDate,
    });

    res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// attendance percentage for all students in a course
const getAttendancePercentageByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ success: false, message: "courseId required" });

    const records = await Attendance.find({ courseId });

    const studentMap = {};

    records.forEach((r) => {
      if (!studentMap[r.studentId]) studentMap[r.studentId] = { total: 0, attended: 0 };

      studentMap[r.studentId].total += 1;
      if (r.status === "Present" || r.status === "Online") studentMap[r.studentId].attended += 1;
    });

    const percentages = {};
    for (const studentId in studentMap) {
      const { total, attended } = studentMap[studentId];
      percentages[studentId] = total === 0 ? 0 : Math.round((attended / total) * 100);
    }

    res.json({ success: true, percentages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAttendancePercentageByCourse };



module.exports = {
  markAttendance,
  getAttendanceByCourse,
  getAttendancePercentageByCourse,
};
