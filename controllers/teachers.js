const Teacher = require("../models/Teacher");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/teachers/"); // Make sure this directory exists
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

// Multer upload configuration for teacher documents
const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "cnicDocument", maxCount: 1 },
  { name: "degreeDocument", maxCount: 1 },
  { name: "cvDocument", maxCount: 1 },
  { name: "medicalRecords", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 1 },
]);

// Create a new teacher
const createTeacher = async (req, res) => {
  const teacherData = req.body;

  // Handle file uploads
  if (req.files) {
    if (req.files.photo) {
      teacherData.photo = req.files.photo[0].path;
    }
    if (req.files.cnicDocument) {
      teacherData.relatedDocuments = {
        ...teacherData.relatedDocuments,
        cnicDocument: req.files.cnicDocument[0].path,
      };
    }
    if (req.files.degreeDocument) {
      teacherData.relatedDocuments = {
        ...teacherData.relatedDocuments,
        degreeDocument: req.files.degreeDocument[0].path,
      };
    }
    if (req.files.cvDocument) {
      teacherData.relatedDocuments = {
        ...teacherData.relatedDocuments,
        cvDocument: req.files.cvDocument[0].path,
      };
    }
    if (req.files.medicalRecords) {
      teacherData.relatedDocuments = {
        ...teacherData.relatedDocuments,
        medicalRecords: req.files.medicalRecords[0].path,
      };
    }
    if (req.files.additionalDocuments) {
      teacherData.relatedDocuments = {
        ...teacherData.relatedDocuments,
        additionalDocuments: req.files.additionalDocuments[0].path,
      };
    }
  }

  const teacher = await Teacher.create(teacherData);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Teacher created successfully",
    teacher,
  });
};

// Get all teachers
const getAllTeachers = async (req, res) => {
  const { status, course, search, page = 1, limit = 10 } = req.query;

  const queryObject = {};

  // Filter by status
  if (status) {
    queryObject.status = status;
  }

  // Filter by course
  if (course) {
    queryObject["unassignedCourses.selectedCourse"] = course;
  }

  // Search functionality
  if (search) {
    queryObject.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { teacherId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const teachers = await Teacher.find(queryObject)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const totalTeachers = await Teacher.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    success: true,
    count: teachers.length,
    total: totalTeachers,
    page: Number(page),
    totalPages: Math.ceil(totalTeachers / limit),
    teachers,
  });
};

// Get single teacher
const getTeacher = async (req, res) => {
  const { id } = req.params;

  const teacher = await Teacher.findById(id);

  if (!teacher) {
    throw new NotFoundError(`No teacher found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    teacher,
  });
};

// Update teacher
const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const updateData = {};

  // Parse nested objects from form-data
  const bodyData = { ...req.body };

  // Handle qualification object
  if (bodyData["qualification.degree"] || bodyData["qualification[degree]"]) {
    updateData.qualification = {
      degree:
        bodyData["qualification.degree"] || bodyData["qualification[degree]"],
      institute:
        bodyData["qualification.institute"] ||
        bodyData["qualification[institute]"],
      passingYear: parseInt(
        bodyData["qualification.passingYear"] ||
          bodyData["qualification[passingYear]"]
      ),
      obtainedCGPA: parseFloat(
        bodyData["qualification.obtainedCGPA"] ||
          bodyData["qualification[obtainedCGPA]"]
      ),
    };
    // Remove these from bodyData so they don't get processed in the main loop
    delete bodyData["qualification.degree"];
    delete bodyData["qualification.institute"];
    delete bodyData["qualification.passingYear"];
    delete bodyData["qualification.obtainedCGPA"];
    delete bodyData["qualification[degree]"];
    delete bodyData["qualification[institute]"];
    delete bodyData["qualification[passingYear]"];
    delete bodyData["qualification[obtainedCGPA]"];
  }

  // Handle unassignedCourses object
  if (
    bodyData["unassignedCourses.selectedCourse"] ||
    bodyData["unassignedCourses[selectedCourse]"]
  ) {
    updateData.unassignedCourses = {
      selectedCourse:
        bodyData["unassignedCourses.selectedCourse"] ||
        bodyData["unassignedCourses[selectedCourse]"],
      designation:
        bodyData["unassignedCourses.designation"] ||
        bodyData["unassignedCourses[designation]"],
      dateOfJoining: new Date(
        bodyData["unassignedCourses.dateOfJoining"] ||
          bodyData["unassignedCourses[dateOfJoining]"]
      ),
    };
    delete bodyData["unassignedCourses.selectedCourse"];
    delete bodyData["unassignedCourses.designation"];
    delete bodyData["unassignedCourses.dateOfJoining"];
    delete bodyData["unassignedCourses[selectedCourse]"];
    delete bodyData["unassignedCourses[designation]"];
    delete bodyData["unassignedCourses[dateOfJoining]"];
  }

  // Handle emergencyContact object
  if (bodyData["emergencyContact.name"] || bodyData["emergencyContact[name]"]) {
    updateData.emergencyContact = {
      name:
        bodyData["emergencyContact.name"] || bodyData["emergencyContact[name]"],
      relationship:
        bodyData["emergencyContact.relationship"] ||
        bodyData["emergencyContact[relationship]"],
      phoneNumber:
        bodyData["emergencyContact.phoneNumber"] ||
        bodyData["emergencyContact[phoneNumber]"],
    };
    delete bodyData["emergencyContact.name"];
    delete bodyData["emergencyContact.relationship"];
    delete bodyData["emergencyContact.phoneNumber"];
    delete bodyData["emergencyContact[name]"];
    delete bodyData["emergencyContact[relationship]"];
    delete bodyData["emergencyContact[phoneNumber]"];
  }

  // Only include fields that are actually being updated
  Object.keys(bodyData).forEach((key) => {
    if (
      bodyData[key] !== undefined &&
      bodyData[key] !== null &&
      bodyData[key] !== ""
    ) {
      updateData[key] = bodyData[key];
    }
  });

  // Handle file uploads for update
  if (req.files) {
    if (req.files.photo) {
      updateData.photo = req.files.photo[0].path;
    }
    if (req.files.cnicDocument) {
      updateData["relatedDocuments.cnicDocument"] =
        req.files.cnicDocument[0].path;
    }
    if (req.files.degreeDocument) {
      updateData["relatedDocuments.degreeDocument"] =
        req.files.degreeDocument[0].path;
    }
    if (req.files.cvDocument) {
      updateData["relatedDocuments.cvDocument"] = req.files.cvDocument[0].path;
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

  // Check if teacher exists first
  const existingTeacher = await Teacher.findById(id);
  if (!existingTeacher) {
    throw new NotFoundError(`No teacher found with id: ${id}`);
  }

  // Use $set to update only specific fields without validation on unchanged fields
  const teacher = await Teacher.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: false, // Disable validators for partial updates
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Teacher updated successfully",
    teacher,
  });
};

// Delete teacher
const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  const teacher = await Teacher.findByIdAndDelete(id);

  if (!teacher) {
    throw new NotFoundError(`No teacher found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Teacher deleted successfully",
    teacher,
  });
};

// Get teacher statistics
const getTeacherStats = async (req, res) => {
  const totalTeachers = await Teacher.countDocuments();
  const activeTeachers = await Teacher.countDocuments({ status: "Active" });
  const inactiveTeachers = await Teacher.countDocuments({ status: "Inactive" });
  const onLeaveTeachers = await Teacher.countDocuments({ status: "On Leave" });
  const terminatedTeachers = await Teacher.countDocuments({
    status: "Terminated",
  });

  // Course-wise statistics
  const courseStats = await Teacher.aggregate([
    {
      $group: {
        _id: "$unassignedCourses.selectedCourse",
        count: { $sum: 1 },
        designations: { $addToSet: "$unassignedCourses.designation" },
      },
    },
  ]);

  // Qualification-wise statistics
  const qualificationStats = await Teacher.aggregate([
    {
      $group: {
        _id: "$qualification.degree",
        count: { $sum: 1 },
        avgCGPA: { $avg: "$qualification.obtainedCGPA" },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    statistics: {
      total: totalTeachers,
      active: activeTeachers,
      inactive: inactiveTeachers,
      onLeave: onLeaveTeachers,
      terminated: terminatedTeachers,
      courseWise: courseStats,
      qualificationWise: qualificationStats,
    },
  });
};

module.exports = {
  createTeacher,
  getAllTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,
  uploadFields, // Export for use in routes
};
