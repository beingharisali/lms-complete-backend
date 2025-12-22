const qs = require("qs");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// ✅ Create Student
const createStudent = async (req, res) => {
  try {
    const bodyString = JSON.stringify(req.body);
    const convertedBody = qs.parse(JSON.parse(bodyString));

    console.log("✅ Converted Body (Create):", convertedBody);

    const studentData = {
      studentId: convertedBody.studentId,
      fullName: convertedBody.fullName,
      dateOfBirth: convertedBody.dateOfBirth,
      gender: convertedBody.gender,
      phone: convertedBody.phone,
      email: convertedBody.email,
      cnicBForm: convertedBody.cnicBForm,
      address: convertedBody.address,
      // csr: convertedBody.csr,

      password: await bcrypt.hash(convertedBody.password, 10),

      parentGuardian: {
        name: convertedBody.parentGuardian?.name,
        phone: convertedBody.parentGuardian?.phone,
      },
      courses: {
        selectedCourse: convertedBody.courses?.selectedCourse,
        csr: convertedBody.courses?.csr,
        batch: convertedBody.courses?.batch,
        totalFees: convertedBody.courses?.totalFees,
        downPayment: convertedBody.courses?.downPayment,
        numberOfInstallments: convertedBody.courses?.numberOfInstallments,
        feePerInstallment: convertedBody.courses?.feePerInstallment,
        amountPaid: convertedBody.courses?.amountPaid,
        SubmitFee: convertedBody.courses?.SubmitFee,
        customPaymentMethod: convertedBody.courses?.customPaymentMethod, // ✅ new line
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
        studentData.parentCnic = req.files.parentCnic[0].path.replace(
          /\\/g,
          "/"
        );
      if (req.files.medicalRecords)
        studentData.medicalRecords = req.files.medicalRecords[0].path.replace(
          /\\/g,
          "/"
        );
      if (req.files.additionalDocuments)
        studentData.additionalDocuments =
          req.files.additionalDocuments[0].path.replace(/\\/g, "/");
    }

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

// ✅ Get All Students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Student By ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Student
// const updateStudent = async (req, res) => {
//   try {
//     // const bodyString = JSON.stringify(req.body);
//     // const convertedBody = qs.parse(JSON.parse(bodyString));
//  const convertedBody = req.body;
//     // console.log("✅ Body (Update):", convertedBody);
//     console.log("✅ Converted Body (Update):", convertedBody);

//     const updateData = {
//       studentId: convertedBody.studentId,
//       fullName: convertedBody.fullName,
//       dateOfBirth: convertedBody.dateOfBirth,
//       gender: convertedBody.gender,
//       phone: convertedBody.phone,
//       email: convertedBody.email,
//       cnicBForm: convertedBody.cnicBForm,
//       address: convertedBody.address,
//       csr: convertedBody.csr,
//       parentGuardian: {
//         name: convertedBody.parentGuardian?.name,
//         phone: convertedBody.parentGuardian?.phone,
//       },
//       courses: {
//         selectedCourse: convertedBody.courses?.selectedCourse,
//         batch: convertedBody.courses?.batch,
//         totalFees: convertedBody.courses?.totalFees,
//         downPayment: convertedBody.courses?.downPayment,
//         numberOfInstallments: convertedBody.courses?.numberOfInstallments,
//         feePerInstallment: convertedBody.courses?.feePerInstallment,
//         amountPaid: convertedBody.courses?.amountPaid,
//       },
//       emergencyContact: {
//         name: convertedBody.emergencyContact?.name,
//         relationship: convertedBody.emergencyContact?.relationship,
//         phoneNumber: convertedBody.emergencyContact?.phoneNumber,
//       },
//     };

//     // ✅ If password is provided, rehash it
//     if (convertedBody.password) {
//       updateData.password = await bcrypt.hash(convertedBody.password, 10);
//     }

//     // ✅ Handle file updates
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

//     // const updatedStudent = await Student.findByIdAndUpdate(
//     //   req.params.id,
//     //   updateData,
//     //   { new: true }
//     // );  //////////////////////////

// const updatedStudent = await Student.findByIdAndUpdate(
//   req.params.id,
//   { $set: updateData },
//   { new: true }
// );

// // const { id } = req.params;
// // const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updatedStudent)
//       return res
//         .status(404)
//         .json({ success: false, message: "Student not found" });

//     res.json({
//       success: true,
//       message: "Student updated successfully",
//       student: updatedStudent,
//     });
//   } catch (error) {
//     console.error("❌ Error updating student:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// controllers/studentController.js

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const safeParse = (v) => {
      if (!v) return undefined;
      try {
        return typeof v === "string" ? JSON.parse(v) : v;
      } catch {
        return v;
      }
    };

    const updateData = {};

    // Map frontend field names to schema field names
    if (body.name !== undefined) updateData.fullName = body.name; // name -> fullName
    if (body.contact !== undefined) updateData.phone = body.contact; // contact -> phone

    // Handle csr - it should be inside courses object in schema
    if (body.csr !== undefined) {
      updateData.courses = updateData.courses || {};
      updateData.courses.csr = body.csr;
    }

    // Build courses object from frontend data
    if (
      body.course !== undefined ||
      body.totalFees !== undefined ||
      body.feePaid !== undefined ||
      body.installments !== undefined ||
      body.perInstallment !== undefined ||
      body.paymentMethod !== undefined ||
      body.customPaymentMethod !== undefined
    ) {
      updateData.courses = updateData.courses || {};

      if (body.course !== undefined)
        updateData.courses.selectedCourse = body.course;
      if (body.totalFees !== undefined)
        updateData.courses.totalFees = body.totalFees;
      if (body.feePaid !== undefined)
        updateData.courses.amountPaid = body.feePaid; // feePaid -> amountPaid
      if (body.installments !== undefined)
        updateData.courses.numberOfInstallments = body.installments;
      if (body.perInstallment !== undefined)
        updateData.courses.feePerInstallment = body.perInstallment;

      // Handle payment method - IMPORTANT: paymentMethod from frontend should map to SubmitFee
      if (body.paymentMethod !== undefined) {
        updateData.courses.SubmitFee = body.paymentMethod;
      }

      // Handle custom payment method
      if (body.customPaymentMethod !== undefined) {
        updateData.courses.customPaymentMethod = body.customPaymentMethod;
      }
    }

    // Check if courses data was sent as an object
    const courses = safeParse(body.courses) || {};
    if (Object.keys(courses).length > 0) {
      updateData.courses = updateData.courses || {};

      // Map all course fields
      if (courses.selectedCourse !== undefined)
        updateData.courses.selectedCourse = courses.selectedCourse;
      if (courses.csr !== undefined) updateData.courses.csr = courses.csr;
      if (courses.totalFees !== undefined)
        updateData.courses.totalFees = courses.totalFees;
      if (courses.numberOfInstallments !== undefined)
        updateData.courses.numberOfInstallments = courses.numberOfInstallments;
      if (courses.feePerInstallment !== undefined)
        updateData.courses.feePerInstallment = courses.feePerInstallment;
      if (courses.amountPaid !== undefined)
        updateData.courses.amountPaid = courses.amountPaid;
      if (courses.enrolledDate !== undefined)
        updateData.courses.enrolledDate = courses.enrolledDate;
      if (courses.SubmitFee !== undefined)
        updateData.courses.SubmitFee = courses.SubmitFee;
      if (courses.customPaymentMethod !== undefined)
        updateData.courses.customPaymentMethod = courses.customPaymentMethod;
    }

    console.log("✅ Mapped updateData (before DB):", updateData);

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    console.log("✅ Updated student returned by Mongoose:", updatedStudent);
    return res.json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Student
const deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllStudents = async () => {
  const res = await fetch("/api/students"); // or your endpoint
  const data = await res.json();
  setStudents(data);
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllStudents,
};
