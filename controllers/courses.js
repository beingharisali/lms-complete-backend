const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
fs.mkdirSync("uploads/courses", { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/courses/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new BadRequestError("Only image files are allowed for course image"), false);
    }
  },
});

const uploadCourseImage = upload.single("courseImage");

// Utility to sanitize empty object values (like photo: {})
const sanitizeBody = (body) => {
  for (let key in body) {
    if (typeof body[key] === "object" && Object.keys(body[key]).length === 0) {
      delete body[key];
    }
  }
  return body;
};

const createCourse = async (req, res) => {
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can create courses");
  }

  let courseData = sanitizeBody(req.body);

  if (!courseData.instructorEmail) {
    throw new BadRequestError("Instructor email is required");
  }

  const instructor = await Teacher.findOne({
    email: courseData.instructorEmail,
  });

  if (!instructor) {
    throw new NotFoundError(
      `No instructor found with email: ${courseData.instructorEmail}`
    );
  }

  if (instructor.status !== "Active") {
    throw new BadRequestError("Cannot assign course to an inactive instructor");
  }

  courseData.instructor = instructor._id;
  courseData.instructorName = `${instructor.firstName} ${instructor.lastName}`;
  courseData.phoneNumber = courseData.phoneNumber || instructor.phone;
  courseData.createdBy = req.user.userId;

  if (req.file) {
    courseData.courseImage = req.file.path;
  }

  const existingCourse = await Course.findOne({
    courseId: courseData.courseId,
  });
  if (existingCourse) {
    throw new BadRequestError("Course ID already exists");
  }

  const enrolled = parseInt(courseData.noOfStudentsEnrolled) || 0;
  const certified = parseInt(courseData.certifiedStudents) || 0;
  const freezed = parseInt(courseData.freezedStudents) || 0;

  if (certified > enrolled) {
    throw new BadRequestError(
      "Certified students cannot exceed enrolled students"
    );
  }

  if (freezed > enrolled) {
    throw new BadRequestError(
      "Freezed students cannot exceed enrolled students"
    );
  }

  const totalLectures = parseInt(courseData.totalLectures) || 0;
  const delivered = parseInt(courseData.lecturesDelivered) || 0;

  if (delivered > totalLectures) {
    throw new BadRequestError(
      "Lectures delivered cannot exceed total lectures"
    );
  }

  const course = await Course.create(courseData);

  await course.populate("instructor", "firstName lastName email phone");

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Course created successfully and assigned to instructor",
    course,
  });
};

const getAllCourses = async (req, res) => {
  const {
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const queryObject = {};

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ email: req.user.email });
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found");
    }
    queryObject.instructor = teacher._id;
  }

  if (status) {
    queryObject.status = status;
  }

  if (search) {
    queryObject.$or = [
      { courseName: { $regex: search, $options: "i" } },
      { courseId: { $regex: search, $options: "i" } },
      { instructorName: { $regex: search, $options: "i" } },
      { instructorEmail: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const courses = await Course.find(queryObject)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate("instructor", "firstName lastName email phone status")
    .populate("createdBy", "name email");

  const totalCourses = await Course.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    success: true,
    count: courses.length,
    total: totalCourses,
    page: Number(page),
    totalPages: Math.ceil(totalCourses / limit),
    courses,
  });
};

const getCourse = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate("instructor", "firstName lastName email phone status teacherId")
    .populate("createdBy", "name email");

  if (!course) {
    throw new NotFoundError(`No course found with id: ${id}`);
  }

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ email: req.user.email });
    if (
      !teacher ||
      course.instructor._id.toString() !== teacher._id.toString()
    ) {
      throw new UnauthenticatedError("You can only view your own courses");
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    course,
  });
};

const updateCourse = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can update courses");
  }

  const updateData = sanitizeBody({ ...req.body });

  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    throw new NotFoundError(`No course found with id: ${id}`);
  }

  if (updateData.courseId && updateData.courseId !== existingCourse.courseId) {
    const duplicate = await Course.findOne({ courseId: updateData.courseId });
    if (duplicate) {
      throw new BadRequestError("Course ID already exists");
    }
  }

  if (updateData.instructorEmail) {
    const instructor = await Teacher.findOne({
      email: updateData.instructorEmail,
    });

    if (!instructor) {
      throw new NotFoundError(
        `No instructor found with email: ${updateData.instructorEmail}`
      );
    }

    if (instructor.status !== "Active") {
      throw new BadRequestError(
        "Cannot assign course to an inactive instructor"
      );
    }

    updateData.instructor = instructor._id;
    updateData.instructorName = `${instructor.firstName} ${instructor.lastName}`;
    if (!updateData.phoneNumber) {
      updateData.phoneNumber = instructor.phone;
    }
  }

  if (req.file) {
    updateData.courseImage = req.file.path;
  }

  // Compute new values for validation
  const newEnrolled = updateData.noOfStudentsEnrolled !== undefined 
    ? parseInt(updateData.noOfStudentsEnrolled) 
    : existingCourse.noOfStudentsEnrolled;

  const newCertified = updateData.certifiedStudents !== undefined 
    ? parseInt(updateData.certifiedStudents) 
    : existingCourse.certifiedStudents;

  const newFreezed = updateData.freezedStudents !== undefined 
    ? parseInt(updateData.freezedStudents) 
    : existingCourse.freezedStudents;

  if (newCertified > newEnrolled) {
    throw new BadRequestError(
      "Certified students cannot exceed enrolled students"
    );
  }

  if (newFreezed > newEnrolled) {
    throw new BadRequestError(
      "Freezed students cannot exceed enrolled students"
    );
  }

  const newTotalLectures = updateData.totalLectures !== undefined 
    ? parseInt(updateData.totalLectures) 
    : existingCourse.totalLectures;

  const newDelivered = updateData.lecturesDelivered !== undefined 
    ? parseInt(updateData.lecturesDelivered) 
    : existingCourse.lecturesDelivered;

  if (newDelivered > newTotalLectures) {
    throw new BadRequestError(
      "Lectures delivered cannot exceed total lectures"
    );
  }

  const course = await Course.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("instructor", "firstName lastName email phone status")
    .populate("createdBy", "name email");

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Course updated successfully",
    course,
  });
};

const deleteCourse = async (req, res) => {
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can delete courses");
  }

  const { id } = req.params;

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    throw new NotFoundError(`No course found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Course deleted successfully",
    course,
  });
};

const getCourseStats = async (req, res) => {
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can view statistics");
  }

  const totalCourses = await Course.countDocuments();
  const activeCourses = await Course.countDocuments({ status: "Active" });
  const completedCourses = await Course.countDocuments({ status: "Completed" });
  const upcomingCourses = await Course.countDocuments({ status: "Upcoming" });
  const inactiveCourses = await Course.countDocuments({ status: "Inactive" });

  const studentStats = await Course.aggregate([
    {
      $group: {
        _id: null,
        totalEnrolled: { $sum: "$noOfStudentsEnrolled" },
        totalCertified: { $sum: "$certifiedStudents" },
        totalFreezed: { $sum: "$freezedStudents" },
      },
    },
  ]);

  const instructorStats = await Course.aggregate([
    {
      $group: {
        _id: "$instructor",
        courseCount: { $sum: 1 },
        totalStudents: { $sum: "$noOfStudentsEnrolled" },
        instructorName: { $first: "$instructorName" },
        instructorEmail: { $first: "$instructorEmail" },
      },
    },
    { $sort: { courseCount: -1 } },
  ]);

  const lectureStats = await Course.aggregate([
    {
      $group: {
        _id: null,
        totalLectures: { $sum: "$totalLectures" },
        totalDelivered: { $sum: "$lecturesDelivered" },
        avgProgress: {
          $avg: {
            $cond: [
              { $eq: ["$totalLectures", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$lecturesDelivered", "$totalLectures"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    statistics: {
      totalCourses,
      coursesByStatus: {
        active: activeCourses,
        completed: completedCourses,
        upcoming: upcomingCourses,
        inactive: inactiveCourses,
      },
      students: studentStats[0] || {
        totalEnrolled: 0,
        totalCertified: 0,
        totalFreezed: 0,
      },
      lectures: lectureStats[0] || {
        totalLectures: 0,
        totalDelivered: 0,
        avgProgress: 0,
      },
      instructors: instructorStats,
    },
  });
};

const getMyCoursesAsTeacher = async (req, res) => {
  if (req.user.role !== "teacher") {
    throw new UnauthenticatedError("Only teachers can access this endpoint");
  }

  const teacher = await Teacher.findOne({ email: req.user.email });
  if (!teacher) {
    throw new NotFoundError("Teacher profile not found");
  }

  const courses = await Course.find({ instructor: teacher._id })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter((c) => c.status === "Active").length,
    totalStudents: courses.reduce((sum, c) => sum + c.noOfStudentsEnrolled, 0),
    totalCertified: courses.reduce((sum, c) => sum + c.certifiedStudents, 0),
    totalLectures: courses.reduce((sum, c) => sum + c.totalLectures, 0),
    lecturesDelivered: courses.reduce((sum, c) => sum + c.lecturesDelivered, 0),
  };

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Your assigned courses",
    count: courses.length,
    statistics: stats,
    courses,
  });
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getMyCoursesAsTeacher,
  uploadCourseImage,
};
