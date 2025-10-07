// const Student = require("../models/Student");
// const User = require("../models/User");
// const { StatusCodes } = require("http-status-codes");
// const {
//   BadRequestError,
//   NotFoundError,
//   UnauthenticatedError,
// } = require("../errors");
// const multer = require("multer");
// const path = require("path");

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Make sure this directory exists
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: function (req, file, cb) {
//     // Allow images for photo
//     if (file.fieldname === "photo") {
//       if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//       } else {
//         cb(new Error("Photo must be an image file"), false);
//       }
//     }
//     // Allow documents for other fields
//     else {
//       const allowedMimes = [
//         "image/jpeg",
//         "image/png",
//         "image/jpg",
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ];
//       if (allowedMimes.includes(file.mimetype)) {
//         cb(null, true);
//       } else {
//         cb(
//           new Error("Only images, PDF, and Word documents are allowed"),
//           false
//         );
//       }
//     }
//   },
// });

// // Multer upload configuration
// const uploadFields = upload.fields([
//   { name: "photo", maxCount: 1 },
//   { name: "studentCnicBForm", maxCount: 1 },
//   { name: "parentCnic", maxCount: 1 },
//   { name: "medicalRecords", maxCount: 1 },
//   { name: "additionalDocuments", maxCount: 1 },
// ]);

// // Create a new student (Only admin can create)
// const createStudent = async (req, res) => {
//   // Check if user is admin
//   if (req.user.role !== "admin") {
//     throw new UnauthenticatedError("Only admin can create students");
//   }

//   const studentData = req.body;

//   // Validate required authentication fields
//   if (!studentData.email || !studentData.password) {
//     throw new BadRequestError("Email and password are required");
//   }

//   // Check if email already exists
//   const existingUser = await User.findOne({ email: studentData.email });
//   const existingStudent = await Student.findOne({ email: studentData.email });

//   if (existingUser || existingStudent) {
//     throw new BadRequestError("Email already exists");
//   }

//   // Set role automatically
//   studentData.role = "student";
//   studentData.createdBy = req.user.userId;

//   // Handle file uploads
//   if (req.files) {
//     if (req.files.photo) {
//       studentData.photo = req.files.photo[0].path;
//     }
//     if (req.files.studentCnicBForm) {
//       studentData.relatedDocuments = {
//         ...studentData.relatedDocuments,
//         studentCnicBForm: req.files.studentCnicBForm[0].path,
//       };
//     }
//     if (req.files.parentCnic) {
//       studentData.relatedDocuments = {
//         ...studentData.relatedDocuments,
//         parentCnic: req.files.parentCnic[0].path,
//       };
//     }
//     if (req.files.medicalRecords) {
//       studentData.relatedDocuments = {
//         ...studentData.relatedDocuments,
//         medicalRecords: req.files.medicalRecords[0].path,
//       };
//     }
//     if (req.files.additionalDocuments) {
//       studentData.relatedDocuments = {
//         ...studentData.relatedDocuments,
//         additionalDocuments: req.files.additionalDocuments[0].path,
//       };
//     }
//   }

//   // Create student
//   const student = await Student.create(studentData);

//   // Create corresponding User record for authentication
//   const user = await User.create({
//     name: `${studentData.firstName} ${studentData.lastName}`,
//     email: studentData.email,
//     password: studentData.password,
//     role: "student",
//     roleReference: student._id,
//     roleModel: "Student",
//   });

//   res.status(StatusCodes.CREATED).json({
//     success: true,
//     message: "Student created successfully",
//     student: {
//       ...student.toJSON(),
//       userCredentials: {
//         email: user.email,
//         role: user.role,
//       },
//     },
//   });
// };

// // Get all students
// const getAllStudents = async (req, res) => {
//   // Allow admin and staff with review permissions
//   if (
//     req.user.role !== "admin" &&
//     !(req.user.role === "staff" && req.user.authorities?.students?.review)
//   ) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   const { status, course, search, page = 1, limit = 10 } = req.query;

//   const queryObject = {};

//   // Filter by status
//   if (status) {
//     queryObject.status = status;
//   }

//   // Filter by course
//   if (course) {
//     queryObject["courses.selectedCourse"] = course;
//   }

//   // Search functionality
//   if (search) {
//     queryObject.$or = [
//       { firstName: { $regex: search, $options: "i" } },
//       { lastName: { $regex: search, $options: "i" } },
//       { studentId: { $regex: search, $options: "i" } },
//       { email: { $regex: search, $options: "i" } },
//     ];
//   }

//   const skip = (page - 1) * limit;

//   const students = await Student.find(queryObject)
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(Number(limit))
//     .populate("createdBy", "name email");

//   const totalStudents = await Student.countDocuments(queryObject);

//   res.status(StatusCodes.OK).json({
//     success: true,
//     count: students.length,
//     total: totalStudents,
//     page: Number(page),
//     totalPages: Math.ceil(totalStudents / limit),
//     students,
//   });
// };

// // Get single student
// const getStudent = async (req, res) => {
//   const { id } = req.params;

//   // Students can only view their own profile, admin and authorized staff can view any
//   if (req.user.role === "student" && req.user.userId !== id) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   if (
//     req.user.role !== "admin" &&
//     req.user.role !== "student" &&
//     !(req.user.role === "staff" && req.user.authorities?.students?.review)
//   ) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   const student = await Student.findById(id).populate(
//     "createdBy",
//     "name email"
//   );

//   if (!student) {
//     throw new NotFoundError(`No student found with id: ${id}`);
//   }

//   res.status(StatusCodes.OK).json({
//     success: true,
//     student,
//   });
// };

// // Update student
// const updateStudent = async (req, res) => {
//   const { id } = req.params;

//   // Students can only update their own profile (limited fields), admin and authorized staff can update any
//   if (req.user.role === "student" && req.user.userId !== id) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   if (
//     req.user.role !== "admin" &&
//     req.user.role !== "student" &&
//     !(req.user.role === "staff" && req.user.authorities?.students?.edit)
//   ) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   const updateData = {};

//   // If student is updating their own profile, restrict fields they can update
//   if (req.user.role === "student") {
//     const allowedFields = ["phone", "address", "emergencyContact"];
//     Object.keys(req.body).forEach((key) => {
//       if (
//         allowedFields.includes(key) &&
//         req.body[key] !== undefined &&
//         req.body[key] !== null &&
//         req.body[key] !== ""
//       ) {
//         updateData[key] = req.body[key];
//       }
//     });
//   } else {
//     // Admin and authorized staff can update all fields
//     Object.keys(req.body).forEach((key) => {
//       if (
//         req.body[key] !== undefined &&
//         req.body[key] !== null &&
//         req.body[key] !== "" &&
//         key !== "password" // Password should be updated separately
//       ) {
//         updateData[key] = req.body[key];
//       }
//     });
//   }

//   // Handle file uploads for update
//   if (req.files) {
//     if (req.files.photo) {
//       updateData.photo = req.files.photo[0].path;
//     }
//     if (req.files.studentCnicBForm) {
//       updateData["relatedDocuments.studentCnicBForm"] =
//         req.files.studentCnicBForm[0].path;
//     }
//     if (req.files.parentCnic) {
//       updateData["relatedDocuments.parentCnic"] = req.files.parentCnic[0].path;
//     }
//     if (req.files.medicalRecords) {
//       updateData["relatedDocuments.medicalRecords"] =
//         req.files.medicalRecords[0].path;
//     }
//     if (req.files.additionalDocuments) {
//       updateData["relatedDocuments.additionalDocuments"] =
//         req.files.additionalDocuments[0].path;
//     }
//   }

//   // Check if student exists first
//   const existingStudent = await Student.findById(id);
//   if (!existingStudent) {
//     throw new NotFoundError(`No student found with id: ${id}`);
//   }

//   // Use $set to update only specific fields without validation on unchanged fields
//   const student = await Student.findByIdAndUpdate(
//     id,
//     { $set: updateData },
//     {
//       new: true,
//       runValidators: false, // Disable validators for partial updates
//     }
//   );

//   res.status(StatusCodes.OK).json({
//     success: true,
//     message: "Student updated successfully",
//     student,
//   });
// };

// // Delete student (Only admin)
// const deleteStudent = async (req, res) => {
//   if (req.user.role !== "admin") {
//     throw new UnauthenticatedError("Only admin can delete students");
//   }

//   const { id } = req.params;

//   const student = await Student.findByIdAndDelete(id);

//   if (!student) {
//     throw new NotFoundError(`No student found with id: ${id}`);
//   }

//   // Also delete the corresponding User record
//   await User.findOneAndDelete({ roleReference: id, roleModel: "Student" });

//   res.status(StatusCodes.OK).json({
//     success: true,
//     message: "Student deleted successfully",
//     student,
//   });
// };

// // Get student statistics
// const getStudentStats = async (req, res) => {
//   // Only admin and authorized staff can view statistics
//   if (
//     req.user.role !== "admin" &&
//     !(req.user.role === "staff" && req.user.authorities?.students?.review)
//   ) {
//     throw new UnauthenticatedError("Access denied");
//   }

//   const totalStudents = await Student.countDocuments();
//   const activeStudents = await Student.countDocuments({ status: "Active" });
//   const inactiveStudents = await Student.countDocuments({ status: "Inactive" });
//   const graduatedStudents = await Student.countDocuments({
//     status: "Graduated",
//   });

//   // Course-wise statistics
//   const courseStats = await Student.aggregate([
//     {
//       $group: {
//         _id: "$courses.selectedCourse",
//         count: { $sum: 1 },
//         totalFees: { $sum: "$courses.totalFees" },
//         totalPaid: { $sum: "$courses.amountPaid" },
//       },
//     },
//   ]);

//   res.status(StatusCodes.OK).json({
//     success: true,
//     statistics: {
//       total: totalStudents,
//       active: activeStudents,
//       inactive: inactiveStudents,
//       graduated: graduatedStudents,
//       courseWise: courseStats,
//     },
//   });
// };

// module.exports = {
//   createStudent,
//   getAllStudents,
//   getStudent,
//   updateStudent,
//   deleteStudent,
//   getStudentStats,
//   uploadFields, // Export for use in routes
// };








// const Student = require("../models/Student");
// const bcrypt = require("bcryptjs");

// // ✅ Create new student
// const createStudent = async (req, res) => {
//   try {
//     const {
//       studentId,
//       fullName,
//       dateOfBirth,
//       gender,
//       phone,
//       email,
//       password,
//       cnicBForm,
//       address,
//       csr,
//       "parentGuardian[name]": parentName,
//       "parentGuardian[phone]": parentPhone,
//       "courses[selectedCourse]": selectedCourse,
//       "courses[batch]": batch,
//       "courses[totalFees]": totalFees,
//       "courses[downPayment]": downPayment,
//       "courses[numberOfInstallments]": numberOfInstallments,
//       "courses[feePerInstallment]": feePerInstallment,
//       "courses[amountPaid]": amountPaid,
//       "courses[enrolledDate]": enrolledDate,
//       "emergencyContact[name]": emergencyName,
//       "emergencyContact[relationship]": emergencyRelationship,
//       "emergencyContact[phoneNumber]": emergencyPhone,
//     } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const student = new Student({
//       studentId,
//       fullName,
//       dateOfBirth,
//       gender,
//       phone,
//       email,
//       password: hashedPassword,
//       cnicBForm,
//       address,
//       csr,
//       parentGuardian: { name: parentName, phone: parentPhone },
//       courses: {
//         selectedCourse,
//         batch,
//         totalFees,
//         downPayment,
//         numberOfInstallments,
//         feePerInstallment,
//         amountPaid,
//         enrolledDate,
//       },
//       emergencyContact: {
//         name: emergencyName,
//         relationship: emergencyRelationship,
//         phoneNumber: emergencyPhone,
//       },
//     });

//     if (req.files) {
//       if (req.files.photo)
//         student.photo = req.files.photo[0].path.replace(/\\/g, "/");
//       if (req.files.studentCnicBForm)
//         student.studentCnicBForm =
//           req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
//       if (req.files.parentCnic)
//         student.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
//       if (req.files.medicalRecords)
//         student.medicalRecords =
//           req.files.medicalRecords[0].path.replace(/\\/g, "/");
//       if (req.files.additionalDocuments)
//         student.additionalDocuments =
//           req.files.additionalDocuments[0].path.replace(/\\/g, "/");
//     }

//     await student.save();

//     res
//       .status(201)
//       .json({ success: true, message: "Student created successfully", student });
//   } catch (error) {
//     console.error("Error creating student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 🟢 Dummy placeholders so routes don’t break
// const getStudents = async (req, res) => {
//   const students = await Student.find();
//   res.status(200).json({ success: true, students });
// };

// const getStudentById = async (req, res) => {
//   const student = await Student.findById(req.params.id);
//   if (!student)
//     return res.status(404).json({ success: false, message: "Not found" });
//   res.status(200).json({ success: true, student });
// };

// const deleteStudent = async (req, res) => {
//   await Student.findByIdAndDelete(req.params.id);
//   res.status(200).json({ success: true, message: "Deleted" });
// };

// // ✅ Export all functions
// module.exports = {
//   createStudent,
//   getStudents,
//   getStudentById,
//   deleteStudent,
// };




// const Student = require("../models/Student");
// const bcrypt = require("bcryptjs");

// // ✅ Create new student
// const createStudent = async (req, res) => {
//   try {
//     // ✅ Convert bracketed keys to dot notation for nested fields
//     for (let key in req.body) {
//       if (key.includes("[")) {
//         const newKey = key.replace(/\[(.*?)\]/g, ".$1");
//         req.body[newKey] = req.body[key];
//         delete req.body[key];
//       }
//     }

//     // ✅ Debug log
//     console.log("Converted Body:", req.body);

//     // ✅ Prepare student data
//     const studentData = {
//       studentId: req.body.studentId,
//       fullName: req.body.fullName,
//       dateOfBirth: req.body.dateOfBirth,
//       gender: req.body.gender,
//       phone: req.body.phone,
//       email: req.body.email,
//       cnicBForm: req.body.cnicBForm,
//       address: req.body.address,
//       csr: req.body.csr,
//       password: await bcrypt.hash(req.body.password, 10),

//       parentGuardian: {
//         name: req.body["parentGuardian.name"],
//         phone: req.body["parentGuardian.phone"],
//       },
//       courses: {
//         selectedCourse: req.body["courses.selectedCourse"],
//         batch: req.body["courses.batch"],
//         totalFees: req.body["courses.totalFees"],
//         downPayment: req.body["courses.downPayment"],
//         feePerInstallment: req.body["courses.feePerInstallment"],
//         amountPaid: req.body["courses.amountPaid"],
//       },
//       emergencyContact: {
//         name: req.body["emergencyContact.name"],
//         relationship: req.body["emergencyContact.relationship"],
//         phoneNumber: req.body["emergencyContact.phoneNumber"],
//       },
//     };

//     // ✅ Handle file uploads
//     if (req.files) {
//       if (req.files.photo)
//         studentData.photo = req.files.photo[0].path.replace(/\\/g, "/");
//       if (req.files.studentCnicBForm)
//         studentData.studentCnicBForm =
//           req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
//       if (req.files.parentCnic)
//         studentData.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
//       if (req.files.medicalRecords)
//         studentData.medicalRecords =
//           req.files.medicalRecords[0].path.replace(/\\/g, "/");
//       if (req.files.additionalDocuments)
//         studentData.additionalDocuments =
//           req.files.additionalDocuments[0].path.replace(/\\/g, "/");
//     }

//     const student = new Student(studentData);
//     await student.save();

//     res.status(201).json({
//       success: true,
//       message: "Student created successfully",
//       student,
//     });
//   } catch (error) {
//     console.error("Error creating student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get all students
// const getStudents = async (req, res) => {
//   try {
//     const students = await Student.find().sort({ createdAt: -1 });
//     res.json({ success: true, count: students.length, students });
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get single student by ID
// const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student)
//       return res.status(404).json({ success: false, message: "Student not found" });

//     res.json({ success: true, student });
//   } catch (error) {
//     console.error("Error fetching student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Update student
// const updateStudent = async (req, res) => {
//   try {
//     // Convert bracketed keys again for consistency
//     for (let key in req.body) {
//       if (key.includes("[")) {
//         const newKey = key.replace(/\[(.*?)\]/g, ".$1");
//         req.body[newKey] = req.body[key];
//         delete req.body[key];
//       }
//     }

//     const updateData = { ...req.body };

//     // Handle files if uploaded
//     if (req.files) {
//       if (req.files.photo)
//         updateData.photo = req.files.photo[0].path.replace(/\\/g, "/");
//       if (req.files.studentCnicBForm)
//         updateData.studentCnicBForm =
//           req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
//       if (req.files.parentCnic)
//         updateData.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
//       if (req.files.medicalRecords)
//         updateData.medicalRecords =
//           req.files.medicalRecords[0].path.replace(/\\/g, "/");
//       if (req.files.additionalDocuments)
//         updateData.additionalDocuments =
//           req.files.additionalDocuments[0].path.replace(/\\/g, "/");
//     }

//     // If password is included, hash it
//     if (updateData.password)
//       updateData.password = await bcrypt.hash(updateData.password, 10);

//     const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!student)
//       return res.status(404).json({ success: false, message: "Student not found" });

//     res.json({ success: true, message: "Student updated successfully", student });
//   } catch (error) {
//     console.error("Error updating student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Delete student
// const deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findByIdAndDelete(req.params.id);
//     if (!student)
//       return res.status(404).json({ success: false, message: "Student not found" });

//     res.json({ success: true, message: "Student deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   createStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent,
// };


const qs = require("qs");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// const createStudent = async (req, res) => {
//   try {
//     // ✅ 1. Convert bracketed keys to dot notation
//     const convertedBody = {};
//     for (let key in req.body) {
//       if (key.includes("[")) {
//         const newKey = key.replace(/\[(.*?)\]/g, ".$1");
//         convertedBody[newKey] = req.body[key];
//       } else {
//         convertedBody[key] = req.body[key];
//       }
//     }

//     console.log("Converted Body:", convertedBody);

//     // ✅ 2. Build structured studentData
//     const studentData = {
//       studentId: convertedBody.studentId,
//       fullName: convertedBody.fullName,
//       dateOfBirth: convertedBody.dateOfBirth,
//       gender: convertedBody.gender,
//       phone: convertedBody.phone,
//       email: convertedBody.email,
//       cnicBForm: convertedBody.cnicBForm,
//       address: convertedBody.address,
//       csr: convertedBody.csr,
//       password: await bcrypt.hash(convertedBody.password, 10),

//       parentGuardian: {
//         name: convertedBody["parentGuardian.name"],
//         phone: convertedBody["parentGuardian.phone"],
//       },
//       courses: {
//         selectedCourse: convertedBody["courses.selectedCourse"],
//         batch: convertedBody["courses.batch"],
//         totalFees: convertedBody["courses.totalFees"],
//         downPayment: convertedBody["courses.downPayment"],
//         feePerInstallment: convertedBody["courses.feePerInstallment"],
//         amountPaid: convertedBody["courses.amountPaid"],
//       },
//       emergencyContact: {
//         name: convertedBody["emergencyContact.name"],
//         relationship: convertedBody["emergencyContact.relationship"],
//         phoneNumber: convertedBody["emergencyContact.phoneNumber"],
//       },
//     };

//     // ✅ 3. File handling
//     if (req.files) {
//       if (req.files.photo)
//         studentData.photo = req.files.photo[0].path.replace(/\\/g, "/");
//       if (req.files.studentCnicBForm)
//         studentData.studentCnicBForm =
//           req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
//       if (req.files.parentCnic)
//         studentData.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
//       if (req.files.medicalRecords)
//         studentData.medicalRecords =
//           req.files.medicalRecords[0].path.replace(/\\/g, "/");
//       if (req.files.additionalDocuments)
//         studentData.additionalDocuments =
//           req.files.additionalDocuments[0].path.replace(/\\/g, "/");
//     }

//     // ✅ 4. Save to database
//     const student = new Student(studentData);
//     await student.save();

//     res.status(201).json({
//       success: true,
//       message: "Student created successfully",
//       student,
//     });
//   } catch (error) {
//     console.error("Error creating student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const createStudent = async (req, res) => {
  try {
    // ✅ Convert form-data (with [ ] fields) into proper nested object
    const bodyString = JSON.stringify(req.body);
    const convertedBody = qs.parse(JSON.parse(bodyString));

    console.log("✅ Converted Body:", convertedBody);

    // ✅ Build structured studentData
    const studentData = {
      studentId: convertedBody.studentId,
      fullName: convertedBody.fullName,
      dateOfBirth: convertedBody.dateOfBirth,
      gender: convertedBody.gender,
      phone: convertedBody.phone,
      email: convertedBody.email,
      cnicBForm: convertedBody.cnicBForm,
      address: convertedBody.address,
      csr: convertedBody.csr,
      password: await bcrypt.hash(convertedBody.password, 10),

      parentGuardian: {
        name: convertedBody.parentGuardian?.name,
        phone: convertedBody.parentGuardian?.phone,
      },
      courses: {
        selectedCourse: convertedBody.courses?.selectedCourse,
        batch: convertedBody.courses?.batch,
        totalFees: convertedBody.courses?.totalFees,
        downPayment: convertedBody.courses?.downPayment,
        numberOfInstallments: convertedBody.courses?.numberOfInstallments,
        feePerInstallment: convertedBody.courses?.feePerInstallment,
        amountPaid: convertedBody.courses?.amountPaid,
      },
      emergencyContact: {
        name: convertedBody.emergencyContact?.name,
        relationship: convertedBody.emergencyContact?.relationship,
        phoneNumber: convertedBody.emergencyContact?.phoneNumber,
      },
    };

    // ✅ Handle file uploads
    if (req.files) {
      if (req.files.photo)
        studentData.photo = req.files.photo[0].path.replace(/\\/g, "/");
      if (req.files.studentCnicBForm)
        studentData.studentCnicBForm =
          req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
      if (req.files.parentCnic)
        studentData.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
      if (req.files.medicalRecords)
        studentData.medicalRecords =
          req.files.medicalRecords[0].path.replace(/\\/g, "/");
      if (req.files.additionalDocuments)
        studentData.additionalDocuments =
          req.files.additionalDocuments[0].path.replace(/\\/g, "/");
    }

    // ✅ Save student
    const student = new Student(studentData);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.error("❌ Error creating student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudents = async (req, res) => {
  const students = await Student.find();
  res.json({ success: true, students });
};

const getStudentById = async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, student });
};

const deleteStudent = async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Student deleted" });
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  deleteStudent,
};
