const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Staff = require("../models/Staff");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

// Register for admin users only (manual admin creation)
const register = async (req, res) => {
  const { name, email, password, role = "admin" } = req.body;

  // Only allow admin role registration through this endpoint
  if (role !== "admin") {
    throw new BadRequestError("This endpoint is only for admin registration");
  }

  // Create user
  const user = await User.create({ name, email, password, role });

  // Generate JWT token
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
};

// Unified login for all user types
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  let user = null;
  let roleData = null;

  // First, try to find user in the main User collection (for admins)
  user = await User.findOne({ email });

  if (user) {
    // User found in main User collection
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Invalid Credentials");
    }

    // If user has a role reference, populate the role data
    if (user.roleReference && user.roleModel) {
      const Model =
        user.roleModel === "Student"
          ? Student
          : user.roleModel === "Teacher"
          ? Teacher
          : Staff;
      roleData = await Model.findById(user.roleReference);
    }
  } else {
    // User not found in main User collection, search in role-specific collections
    const studentUser = await Student.findOne({ email });
    const teacherUser = await Teacher.findOne({ email });
    const staffUser = await Staff.findOne({ email });

    if (studentUser) {
      const isPasswordCorrect = await studentUser.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
      }
      user = {
        _id: studentUser._id,
        name: `${studentUser.firstName} ${studentUser.lastName}`,
        email: studentUser.email,
        role: studentUser.role,
      };
      roleData = studentUser;
    } else if (teacherUser) {
      const isPasswordCorrect = await teacherUser.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
      }
      user = {
        _id: teacherUser._id,
        name: `${teacherUser.firstName} ${teacherUser.lastName}`,
        email: teacherUser.email,
        role: teacherUser.role,
      };
      roleData = teacherUser;
    } else if (staffUser) {
      const isPasswordCorrect = await staffUser.comparePassword(password);
      if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid Credentials");
      }
      user = {
        _id: staffUser._id,
        name: `${staffUser.firstName} ${staffUser.lastName}`,
        email: staffUser.email,
        role: staffUser.role,
      };
      roleData = staffUser;
    } else {
      throw new UnauthenticatedError("Invalid Credentials");
    }
  }

  // Generate JWT token with role information
  const tokenPayload = {
    userId: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const token = require("jsonwebtoken").sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || "30d" }
  );

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleData: roleData, // Include specific role data
    },
    token,
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  const { userId, role } = req.user;

  let user = null;

  if (role === "admin") {
    user = await User.findById(userId).select("-password");
  } else if (role === "student") {
    user = await Student.findById(userId).select("-password");
  } else if (role === "teacher") {
    user = await Teacher.findById(userId).select("-password");
  } else if (role === "staff") {
    user = await Staff.findById(userId).select("-password");
  }

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    user,
  });
};

module.exports = {
  register,
  login,
  getProfile,
};
