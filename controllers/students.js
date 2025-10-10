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
const updateStudent = async (req, res) => {
  try {
    const bodyString = JSON.stringify(req.body);
    const convertedBody = qs.parse(JSON.parse(bodyString));

    console.log("✅ Converted Body (Update):", convertedBody);

    const updateData = {
      studentId: convertedBody.studentId,
      fullName: convertedBody.fullName,
      dateOfBirth: convertedBody.dateOfBirth,
      gender: convertedBody.gender,
      phone: convertedBody.phone,
      email: convertedBody.email,
      cnicBForm: convertedBody.cnicBForm,
      address: convertedBody.address,
      csr: convertedBody.csr,
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

    // ✅ If password is provided, rehash it
    if (convertedBody.password) {
      updateData.password = await bcrypt.hash(convertedBody.password, 10);
    }

    // ✅ Handle file updates
    if (req.files) {
      if (req.files.photo)
        updateData.photo = req.files.photo[0].path.replace(/\\/g, "/");
      if (req.files.studentCnicBForm)
        updateData.studentCnicBForm =
          req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
      if (req.files.parentCnic)
        updateData.parentCnic = req.files.parentCnic[0].path.replace(/\\/g, "/");
      if (req.files.medicalRecords)
        updateData.medicalRecords =
          req.files.medicalRecords[0].path.replace(/\\/g, "/");
      if (req.files.additionalDocuments)
        updateData.additionalDocuments =
          req.files.additionalDocuments[0].path.replace(/\\/g, "/");
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedStudent)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });

    res.json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    res.status(500).json({ success: false, message: error.message });
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

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
