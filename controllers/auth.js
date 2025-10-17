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

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || "30d",
  });
};

const register = async (req, res) => {
  const { name, email, password, role = "admin" } = req.body;

  if (role !== "admin") {
    throw new BadRequestError("This endpoint is only for admin registration");
  }

  const user = await User.create({ name, email, password, role });

  const token = signToken({
    userId: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  });

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

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError("Please provide email and password");

  let user = await User.findOne({ email });
  let roleData = null;

  if (user) {
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      throw new UnauthenticatedError("Invalid Credentials");
  } else {
    const studentUser = await Student.findOne({ email });
    const teacherUser = await Teacher.findOne({ email });
    const staffUser = await Staff.findOne({ email });

    const matchedUser = studentUser || teacherUser || staffUser;
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

  const token = signToken({
    userId: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleData,
    },
    token,
  });
};

// controllers/authController.js
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     throw new BadRequestError("Please provide email and password");

//   let user = await User.findOne({ email });
//   let roleData = null;

//   if (user) {
//     const isPasswordCorrect = await user.comparePassword(password);
//     if (!isPasswordCorrect)
//       throw new UnauthenticatedError("Invalid Credentials");
//   } else {
//     const studentUser = await Student.findOne({ email });
//     const teacherUser = await Teacher.findOne({ email });
//     const staffUser = await Staff.findOne({ email });

//     const matchedUser = studentUser || teacherUser || staffUser;
//     if (!matchedUser) throw new UnauthenticatedError("Invalid Credentials");

//     // ✅ No more crash here — every model now has comparePassword
//     const isPasswordCorrect = await matchedUser.comparePassword(password);
//     if (!isPasswordCorrect)
//       throw new UnauthenticatedError("Invalid Credentials");

//     user = {
//       _id: matchedUser._id,
//       name: `${matchedUser.firstName} ${matchedUser.lastName}`,
//       email: matchedUser.email,
//       role: matchedUser.role,
//     };
//     roleData = matchedUser;
//   }

//   const token = signToken({
//     userId: user._id,
//     name: user.name,
//     role: user.role,
//     email: user.email,
//   });

//   res.status(StatusCodes.OK).json({
//     success: true,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       roleData,
//     },
//     token,
//   });
// };

const getProfile = async (req, res) => {
  const { userId, role } = req.user;
  let user = null;

  if (role === "admin") user = await User.findById(userId).select("-password");
  if (role === "student")
    user = await Student.findById(userId).select("-password");
  if (role === "teacher")
    user = await Teacher.findById(userId).select("-password");
  if (role === "staff") user = await Staff.findById(userId).select("-password");

  if (!user) throw new NotFoundError("User not found");

  res.status(StatusCodes.OK).json({ success: true, user });
};

module.exports = { register, login, getProfile };
