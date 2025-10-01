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

// Configure multer for course image uploads
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for course image"), false);
    }
  },
});

// Multer upload configuration for course image
const uploadCourseImage = upload.single("courseImage");

// Create a new course (ONLY ADMIN)
const createCourse = async (req, res) => {
  // ONLY ADMIN CAN CREATE COURSES
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can create courses");
  }

  const courseData = req.body;

  // Validate required fields
  if (!courseData.instructorEmail) {
    throw new BadRequestError("Instructor email is required");
  }

  // Find the instructor by email (must match teacher's email)
  const instructor = await Teacher.findOne({
    email: courseData.instructorEmail,
  });

  if (!instructor) {
    throw new NotFoundError(
      `No instructor found with email: ${courseData.instructorEmail}`
    );
  }

  // Check if instructor is active
  if (instructor.status !== "Active") {
    throw new BadRequestError("Cannot assign course to an inactive instructor");
  }

  // Set instructor details automatically from the teacher record
  courseData.instructor = instructor._id;
  courseData.instructorName = `${instructor.firstName} ${instructor.lastName}`;
  courseData.phoneNumber = courseData.phoneNumber || instructor.phone;
  courseData.createdBy = req.user.userId;

  // Handle file upload
  if (req.file) {
    courseData.courseImage = req.file.path;
  }

  // Check if course ID already exists
  const existingCourse = await Course.findOne({
    courseId: courseData.courseId,
  });
  if (existingCourse) {
    throw new BadRequestError("Course ID already exists");
  }

  // Validate student numbers
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

  // Validate lecture numbers
  const totalLectures = parseInt(courseData.totalLectures) || 0;
  const delivered = parseInt(courseData.lecturesDelivered) || 0;

  if (delivered > totalLectures) {
    throw new BadRequestError(
      "Lectures delivered cannot exceed total lectures"
    );
  }

  // Create course
  const course = await Course.create(courseData);

  // Populate instructor details
  await course.populate("instructor", "firstName lastName email phone");

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Course created successfully and assigned to instructor",
    course,
  });
};

// Get all courses (Admin sees all, Teacher sees only their own)
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

  // If user is a TEACHER, only show THEIR courses
  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ email: req.user.email });
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found");
    }
    queryObject.instructor = teacher._id;
  }

  // Filter by status
  if (status) {
    queryObject.status = status;
  }

  // Search functionality
  if (search) {
    queryObject.$or = [
      { courseName: { $regex: search, $options: "i" } },
      { courseId: { $regex: search, $options: "i" } },
      { instructorName: { $regex: search, $options: "i" } },
      { instructorEmail: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  // Build sort object
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

// Get single course
const getCourse = async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate("instructor", "firstName lastName email phone status teacherId")
    .populate("createdBy", "name email");

  if (!course) {
    throw new NotFoundError(`No course found with id: ${id}`);
  }

  // Teachers can ONLY view their own courses
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

// Update course (ONLY ADMIN)
const updateCourse = async (req, res) => {
  const { id } = req.params;

  // ONLY ADMIN CAN UPDATE
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can update courses");
  }

  const updateData = { ...req.body };

  // Check if course exists
  const existingCourse = await Course.findById(id);
  if (!existingCourse) {
    throw new NotFoundError(`No course found with id: ${id}`);
  }

  // If instructor email is being updated, verify the instructor exists
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
  }

  // Handle file upload
  if (req.file) {
    updateData.courseImage = req.file.path;
  }

  // Validate student numbers if being updated
  if (updateData.noOfStudentsEnrolled !== undefined) {
    const enrolled = parseInt(updateData.noOfStudentsEnrolled);
    const certified = parseInt(
      updateData.certifiedStudents !== undefined
        ? updateData.certifiedStudents
        : existingCourse.certifiedStudents
    );
    const freezed = parseInt(
      updateData.freezedStudents !== undefined
        ? updateData.freezedStudents
        : existingCourse.freezedStudents
    );

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
  }

  // Validate lecture numbers if being updated
  if (updateData.totalLectures !== undefined) {
    const totalLectures = parseInt(updateData.totalLectures);
    const delivered = parseInt(
      updateData.lecturesDelivered !== undefined
        ? updateData.lecturesDelivered
        : existingCourse.lecturesDelivered
    );

    if (delivered > totalLectures) {
      throw new BadRequestError(
        "Lectures delivered cannot exceed total lectures"
      );
    }
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

// Delete course (ONLY ADMIN)
const deleteCourse = async (req, res) => {
  // ONLY ADMIN CAN DELETE
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

// Get course statistics (ONLY ADMIN)
const getCourseStats = async (req, res) => {
  // ONLY ADMIN
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can view statistics");
  }

  const totalCourses = await Course.countDocuments();
  const activeCourses = await Course.countDocuments({ status: "Active" });
  const completedCourses = await Course.countDocuments({ status: "Completed" });
  const upcomingCourses = await Course.countDocuments({ status: "Upcoming" });
  const inactiveCourses = await Course.countDocuments({ status: "Inactive" });

  // Total students across all courses
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

  // Instructor-wise course count
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

  // Lecture progress statistics
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

// Get teacher's own courses (ONLY TEACHER)
const getMyCoursesAsTeacher = async (req, res) => {
  // ONLY TEACHERS can access this
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

  // Calculate teacher's statistics
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
