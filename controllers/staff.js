const Staff = require("../models/Staff");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require("../errors");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/staff/"); // Make sure this directory exists
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
    // Allow documents for all fields
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
      cb(new Error("Only images, PDF, and Word documents are allowed"), false);
    }
  },
});

// Multer upload configuration for staff documents
const uploadFields = upload.fields([
  { name: "cnicDocument", maxCount: 1 },
  { name: "medicalRecords", maxCount: 1 },
  { name: "additionalDocuments", maxCount: 1 },
]);

// Create a new staff member (Only admin can create)
const createStaff = async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can create staff members");
  }

  const staffData = req.body;

  // Validate required authentication fields
  if (!staffData.email || !staffData.password) {
    throw new BadRequestError("Email and password are required");
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: staffData.email });
  const existingStaff = await Staff.findOne({ email: staffData.email });

  if (existingUser || existingStaff) {
    throw new BadRequestError("Email already exists");
  }

  // Set role automatically
  staffData.role = "staff";
  staffData.createdBy = req.user.userId;

  // Parse authorities if they are sent as strings
  if (typeof staffData.authorities === "string") {
    staffData.authorities = JSON.parse(staffData.authorities);
  }

  // Handle file uploads
  if (req.files) {
    if (req.files.cnicDocument) {
      staffData.relatedDocuments = {
        ...staffData.relatedDocuments,
        cnicDocument: req.files.cnicDocument[0].path,
      };
    }
    if (req.files.medicalRecords) {
      staffData.relatedDocuments = {
        ...staffData.relatedDocuments,
        medicalRecords: req.files.medicalRecords[0].path,
      };
    }
    if (req.files.additionalDocuments) {
      staffData.relatedDocuments = {
        ...staffData.relatedDocuments,
        additionalDocuments: req.files.additionalDocuments[0].path,
      };
    }
  }

  // Create staff
  const staff = await Staff.create(staffData);

  // Create corresponding User record for authentication
  const user = await User.create({
    name: `${staffData.firstName} ${staffData.lastName}`,
    email: staffData.email,
    password: staffData.password,
    role: "staff",
    roleReference: staff._id,
    roleModel: "Staff",
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Staff member created successfully",
    staff: {
      ...staff.toJSON(),
      userCredentials: {
        email: user.email,
        role: user.role,
      },
    },
  });
};

// Get all staff members
const getAllStaff = async (req, res) => {
  // Only admin can view all staff
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can view all staff members");
  }

  const { status, designation, search, page = 1, limit = 10 } = req.query;

  const queryObject = {};

  // Filter by status
  if (status) {
    queryObject.status = status;
  }

  // Filter by designation
  if (designation) {
    queryObject["qualification.designation"] = designation;
  }

  // Search functionality
  if (search) {
    queryObject.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { cnic: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const staff = await Staff.find(queryObject)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("createdBy", "name email");

  const totalStaff = await Staff.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    success: true,
    count: staff.length,
    total: totalStaff,
    page: Number(page),
    totalPages: Math.ceil(totalStaff / limit),
    staff,
  });
};

// Get single staff member
const getStaff = async (req, res) => {
  const { id } = req.params;

  // Staff can only view their own profile, admin can view any
  if (req.user.role === "staff" && req.user.userId !== id) {
    throw new UnauthenticatedError("Access denied");
  }

  if (req.user.role !== "admin" && req.user.role !== "staff") {
    throw new UnauthenticatedError("Access denied");
  }

  const staff = await Staff.findById(id).populate("createdBy", "name email");

  if (!staff) {
    throw new NotFoundError(`No staff member found with id: ${id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    staff,
  });
};

// Update staff member
const updateStaff = async (req, res) => {
  const { id } = req.params;

  // Staff can only update their own profile (limited fields), admin can update any
  if (req.user.role === "staff" && req.user.userId !== id) {
    throw new UnauthenticatedError("Access denied");
  }

  if (req.user.role !== "admin" && req.user.role !== "staff") {
    throw new UnauthenticatedError("Access denied");
  }

  const updateData = {};

  // Parse nested objects from form-data
  const bodyData = { ...req.body };

  // If staff is updating their own profile, restrict fields they can update
  if (req.user.role === "staff") {
    const allowedFields = ["phone", "address", "emergencyContact"];
    Object.keys(bodyData).forEach((key) => {
      if (
        allowedFields.includes(key) &&
        bodyData[key] !== undefined &&
        bodyData[key] !== null &&
        bodyData[key] !== ""
      ) {
        updateData[key] = bodyData[key];
      }
    });
  } else {
    // Admin can update all fields
    // Handle qualification object
    if (
      bodyData["qualification.education"] ||
      bodyData["qualification[education]"]
    ) {
      updateData.qualification = {
        education:
          bodyData["qualification.education"] ||
          bodyData["qualification[education]"],
        institute:
          bodyData["qualification.institute"] ||
          bodyData["qualification[institute]"],
        yearOfPassing: parseInt(
          bodyData["qualification.yearOfPassing"] ||
            bodyData["qualification[yearOfPassing]"]
        ),
        designation:
          bodyData["qualification.designation"] ||
          bodyData["qualification[designation]"],
      };
      // Remove these from bodyData so they don't get processed in the main loop
      delete bodyData["qualification.education"];
      delete bodyData["qualification.institute"];
      delete bodyData["qualification.yearOfPassing"];
      delete bodyData["qualification.designation"];
      delete bodyData["qualification[education]"];
      delete bodyData["qualification[institute]"];
      delete bodyData["qualification[yearOfPassing]"];
      delete bodyData["qualification[designation]"];
    }

    // Handle emergencyContact object
    if (
      bodyData["emergencyContact.name"] ||
      bodyData["emergencyContact[name]"]
    ) {
      updateData.emergencyContact = {
        name:
          bodyData["emergencyContact.name"] ||
          bodyData["emergencyContact[name]"],
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

    // Handle authorities object
    if (bodyData.authorities && typeof bodyData.authorities === "string") {
      updateData.authorities = JSON.parse(bodyData.authorities);
      delete bodyData.authorities;
    }

    // Only include fields that are actually being updated
    Object.keys(bodyData).forEach((key) => {
      if (
        bodyData[key] !== undefined &&
        bodyData[key] !== null &&
        bodyData[key] !== "" &&
        key !== "password" // Password should be updated separately
      ) {
        updateData[key] = bodyData[key];
      }
    });
  }

  // Handle file uploads for update
  if (req.files) {
    if (req.files.cnicDocument) {
      updateData["relatedDocuments.cnicDocument"] =
        req.files.cnicDocument[0].path;
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

  // Check if staff exists first
  const existingStaff = await Staff.findById(id);
  if (!existingStaff) {
    throw new NotFoundError(`No staff member found with id: ${id}`);
  }

  // Use $set to update only specific fields without validation on unchanged fields
  const staff = await Staff.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: false, // Disable validators for partial updates
    }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Staff member updated successfully",
    staff,
  });
};

// Delete staff member (Only admin)
const deleteStaff = async (req, res) => {
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can delete staff members");
  }

  const { id } = req.params;

  const staff = await Staff.findByIdAndDelete(id);

  if (!staff) {
    throw new NotFoundError(`No staff member found with id: ${id}`);
  }

  // Also delete the corresponding User record
  await User.findOneAndDelete({ roleReference: id, roleModel: "Staff" });

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Staff member deleted successfully",
    staff,
  });
};

// Get staff statistics
const getStaffStats = async (req, res) => {
  // Only admin can view statistics
  if (req.user.role !== "admin") {
    throw new UnauthenticatedError("Only admin can view staff statistics");
  }

  const totalStaff = await Staff.countDocuments();
  const activeStaff = await Staff.countDocuments({ status: "Active" });
  const inactiveStaff = await Staff.countDocuments({ status: "Inactive" });
  const onLeaveStaff = await Staff.countDocuments({ status: "On Leave" });
  const terminatedStaff = await Staff.countDocuments({ status: "Terminated" });

  // Designation-wise statistics
  const designationStats = await Staff.aggregate([
    {
      $group: {
        _id: "$qualification.designation",
        count: { $sum: 1 },
      },
    },
  ]);

  // Education-wise statistics
  const educationStats = await Staff.aggregate([
    {
      $group: {
        _id: "$qualification.education",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    statistics: {
      total: totalStaff,
      active: activeStaff,
      inactive: inactiveStaff,
      onLeave: onLeaveStaff,
      terminated: terminatedStaff,
      designationWise: designationStats,
      educationWise: educationStats,
    },
  });
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  uploadFields, // Export for use in routes
};
