// const User = require("../models/User");
// const Student = require("../models/Student");
// const Teacher = require("../models/Teacher");
// const Staff = require("../models/Staff");
// const { StatusCodes } = require("http-status-codes");
// const {
//   BadRequestError,
//   UnauthenticatedError,
//   NotFoundError,
// } = require("../errors");
// const jwt = require("jsonwebtoken");

// const signToken = (payload) => {
//   return jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME || "30d",
//   });
// };

// const register = async (req, res) => {
//   const { name, email, password, role = "admin" } = req.body;

//   if (role !== "admin") {
//     throw new BadRequestError("This endpoint is only for admin registration");
//   }

//   const user = await User.create({ name, email, password, role });
// console.log("✅ Generated JWT Token:", token); // check token
//   const token = signToken({
//     userId: user._id,
//     name: user.name,
//     role: user.role,
//     email: user.email,
//   });
//  console.log("✅ Cookie set in response:", res.getHeader("Set-Cookie")); // check cookie header
//   res.status(StatusCodes.CREATED).json({
//     success: true,
//     user: {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//     token,
//   });
// };

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

// // controllers/authController.js
// // const login = async (req, res) => {
// //   const { email, password } = req.body;

// //   if (!email || !password)
// //     throw new BadRequestError("Please provide email and password");

// //   let user = await User.findOne({ email });
// //   let roleData = null;

// //   if (user) {
// //     const isPasswordCorrect = await user.comparePassword(password);
// //     if (!isPasswordCorrect)
// //       throw new UnauthenticatedError("Invalid Credentials");
// //   } else {
// //     const studentUser = await Student.findOne({ email });
// //     const teacherUser = await Teacher.findOne({ email });
// //     const staffUser = await Staff.findOne({ email });

// //     const matchedUser = studentUser || teacherUser || staffUser;
// //     if (!matchedUser) throw new UnauthenticatedError("Invalid Credentials");

// //     // ✅ No more crash here — every model now has comparePassword
// //     const isPasswordCorrect = await matchedUser.comparePassword(password);
// //     if (!isPasswordCorrect)
// //       throw new UnauthenticatedError("Invalid Credentials");

// //     user = {
// //       _id: matchedUser._id,
// //       name: `${matchedUser.firstName} ${matchedUser.lastName}`,
// //       email: matchedUser.email,
// //       role: matchedUser.role,
// //     };
// //     roleData = matchedUser;
// //   }

// //   const token = signToken({
// //     userId: user._id,
// //     name: user.name,
// //     role: user.role,
// //     email: user.email,
// //   });

// //   res.status(StatusCodes.OK).json({
// //     success: true,
// //     user: {
// //       id: user._id,
// //       name: user.name,
// //       email: user.email,
// //       role: user.role,
// //       roleData,
// //     },
// //     token,
// //   });
// // };

// const getProfile = async (req, res) => {
//   const { userId, role } = req.user;
//   let user = null;

//   if (role === "admin") user = await User.findById(userId).select("-password");
//   if (role === "student")
//     user = await Student.findById(userId).select("-password");
//   if (role === "teacher")
//     user = await Teacher.findById(userId).select("-password");
//   if (role === "staff") user = await Staff.findById(userId).select("-password");

//   if (!user) throw new NotFoundError("User not found");

//   res.status(StatusCodes.OK).json({ success: true, user });
// };

// module.exports = { register, login, getProfile };
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

// ======================= JWT TOKEN GENERATOR =======================
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME || "30d",
  });
};

// ======================= REGISTER =======================
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

  console.log("✅ REGISTER - Generated JWT Token:", token);

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

// ======================= LOGIN =======================
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
    // Check other collections
    const studentUser = await Student.findOne({ email });
    const teacherUser = await Teacher.findOne({ email });
    const staffUser = await Staff.findOne({ email });

    const matchedUser = studentUser || teacherUser || staffUser;
    if (!matchedUser) throw new UnauthenticatedError("Invalid Credentials");

    const isPasswordCorrect = await matchedUser.comparePassword(password);
    if (!isPasswordCorrect)
      throw new UnauthenticatedError("Invalid Credentials");

    // Normalize user object
    user = {
      _id: matchedUser._id,
      name: matchedUser.name || `${matchedUser.firstName} ${matchedUser.lastName}`,
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

  console.log("✅ LOGIN - Token generated:", token);

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

// ======================= GET PROFILE =======================
const getProfile = async (req, res) => {
  const { userId, role } = req.user;
  let user = null;

  console.log(`📌 GET PROFILE - Looking for userId: ${userId} with role: ${role}`);

  try {
    if (role === "admin") {
      user = await User.findById(userId).select("-password");
    } else if (role === "student") {
      user = await Student.findById(userId).select("-password");
    } else if (role === "teacher" || role === "instructor") {
      user = await Teacher.findById(userId).select("-password");

      if (!user) {
        console.log(
          `⚠️ Teacher/Instructor not found in Teacher collection for userId: ${userId}. Falling back to User collection.`
        );
        user = await User.findById(userId).select("-password");
      }
    } else if (role === "staff") {
      user = await Staff.findById(userId).select("-password");
    }

    if (!user) {
      console.log(`❌ GET PROFILE - User not found for role: ${role}, userId: ${userId}`);
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    console.log("✅ GET PROFILE - User found:", user);
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("❌ GET PROFILE - Error:", err.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

module.exports = { register, login, getProfile };
