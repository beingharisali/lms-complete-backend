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
const jwt = require("jsonwebtoken");

// Helper function to set JWT cookie
const attachCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Register for admin users only
const register = async (req, res) => {
  const { name, email, password, role = "admin" } = req.body;

  if (role !== "admin") {
    throw new BadRequestError("This endpoint is only for admin registration");
  }

  const user = await User.create({ name, email, password, role });
  const token = user.createJWT();

  attachCookie(res, token);

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// Unified login for all roles
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  let user = null;
  let roleData = null;

  // Try main User collection first (admins)
  user = await User.findOne({ email });

  if (user) {
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      throw new UnauthenticatedError("Invalid Credentials");

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
    // Search in role-specific collections
    const studentUser = await Student.findOne({ email });
    const teacherUser = await Teacher.findOne({ email });
    const staffUser = await Staff.findOne({ email });

    const matchedUser = studentUser || teacherUser || staffUser || null;

    if (!matchedUser) throw new UnauthenticatedError("Invalid Credentials");

    const isPasswordCorrect = await matchedUser.comparePassword(password);
    if (!isPasswordCorrect)
      throw new UnauthenticatedError("Invalid Credentials");

    user = {
      _id: matchedUser._id,
      name: `${matchedUser.firstName} ${matchedUser.lastName}`,
      email: matchedUser.email,
      role: matchedUser.role,
    };
    roleData = matchedUser;
  }

  // Sign JWT & set cookie
  const tokenPayload = {
    userId: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || "30d",
  });

  attachCookie(res, token);

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleData: roleData,
    },
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

  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ success: true, user });
};

// Logout (clear cookie)
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(StatusCodes.OK).json({ success: true, message: "Logged out" });
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
