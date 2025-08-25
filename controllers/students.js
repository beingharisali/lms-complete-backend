const Student = require("../models/Student");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
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
    // Allow images for photo
    if (file.fieldname === "photo") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Photo must be an image file"), false);
      }
    }
    // Allow documents for other fields
    else {
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error("Only images, PDF, and Word documents are allowed"),
          false
        );
      }
    }
  },
});

// Multer upload configuration
const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "studentCnicBForm", maxCount: 1 },
  { name: "parentCnic", maxCount: 1 },
  { name: "medicalRecords", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 1 },
]);

// Create a new student
const createStudent = async (req, res) => {
  const studentData = req.body;

  // Handle file uploads
  if (req.files) {
    if (req.files.photo) {
      studentData.photo = req.files.photo[0].path;
    }
    if (req.files.studentCnicBForm) {
      studentData.relatedDocuments = {
        ...studentData.relatedDocuments,
        studentCnicBForm: req.files.studentCnicBForm[0].path,
      };
    }
    if (req.files.parentCnic) {
      studentData.relatedDocuments = {
        ...studentData.relatedDocuments,
        parentCnic: req.files.parentCnic[0].path,
      };
    }
    if (req.files.medicalRecords) {
      studentData.relatedDocuments = {
        ...studentData.relatedDocuments,
        medicalRecords: req.files.medicalRecords[0].path,
      };
    }
    if (req.files.additionalDocuments) {
      studentData.relatedDocuments = {
        ...studentData.relatedDocuments,
        additionalDocuments: req.files.additionalDocuments[0].path,
      };
    }
  }

  const student = await Student.create(studentData);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Student created successfully",
    student,
  });
};

// Get all students
const getAllStudents = async (req, res) => {
  const { status, course, search, page = 1, limit = 10 } = req.query;

  const queryObject = {};

  // Filter by status
  if (status) {
    queryObject.status = status;
  }

  // Filter by course
  if (course) {
    queryObject["courses.selectedCourse"] = course;
  }

  // Search functionality
  if (search) {
    queryObject.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const students = await Student.find(queryObject)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalStudents = await Student.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    success: true,
    count: students.length,
    total: totalStudents,
    page: Number(page),
    totalPages: Math.ceil(totalStudents / limit),
    students,
  });
};

// Get single student
const getStudent = async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id);

  if (!student) {
    throw new NotFoundError(`No student found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    student,
  });
};

// Update student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updateData = {};

  // Only include fields that are actually being updated
  Object.keys(req.body).forEach((key) => {
    if (
      req.body[key] !== undefined &&
      req.body[key] !== null &&
      req.body[key] !== ""
    ) {
      updateData[key] = req.body[key];
    }
  });

  // Handle file uploads for update
  if (req.files) {
    if (req.files.photo) {
      updateData.photo = req.files.photo[0].path;
    }
    if (req.files.studentCnicBForm) {
      updateData["relatedDocuments.studentCnicBForm"] =
        req.files.studentCnicBForm[0].path;
    }
    if (req.files.parentCnic) {
      updateData["relatedDocuments.parentCnic"] = req.files.parentCnic[0].path;
    }
    if (req.files.medicalRecords) {
      updateData["relatedDocuments.medicalRecords"] =
        req.files.medicalRecords[0].path;
    }
    if (req.files.additionalDocuments) {
      updateData["relatedDocuments.additionalDocuments"] =
        req.files.additionalDocuments[0].path;
    }
  }

  // Check if student exists first
  const existingStudent = await Student.findById(id);
  if (!existingStudent) {
    throw new NotFoundError(`No student found with id: ${id}`);
  }

  // Use $set to update only specific fields without validation on unchanged fields
  const student = await Student.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: false, // Disable validators for partial updates
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Student updated successfully",
    student,
  });
};

// Delete student
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw new NotFoundError(`No student found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Student deleted successfully",
    student,
  });
};

// Get student statistics
const getStudentStats = async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const activeStudents = await Student.countDocuments({ status: "Active" });
  const inactiveStudents = await Student.countDocuments({ status: "Inactive" });
  const graduatedStudents = await Student.countDocuments({
    status: "Graduated",
  });

  // Course-wise statistics
  const courseStats = await Student.aggregate([
    {
      $group: {
        _id: "$courses.selectedCourse",
        count: { $sum: 1 },
        totalFees: { $sum: "$courses.totalFees" },
        totalPaid: { $sum: "$courses.amountPaid" },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    statistics: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      graduated: graduatedStudents,
      courseWise: courseStats,
    },
  });
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  uploadFields, // Export for use in routes
};
