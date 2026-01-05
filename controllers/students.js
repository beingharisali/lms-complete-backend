const qs = require("qs");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

//  Create Student
const createStudent = async (req, res) => {
  try {
    const bodyString = JSON.stringify(req.body);
    const convertedBody = qs.parse(JSON.parse(bodyString));

    console.log(" Converted Body (Create):", convertedBody);

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

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    console.log("📥 Received PATCH data:", body);

    const updateData = {};

    // basic student fields
    if (body.name !== undefined) updateData.fullName = body.name;
    if (body.studentId !== undefined) updateData.studentId = body.studentId;
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.dateOfBirth !== undefined)
      updateData.dateOfBirth = body.dateOfBirth;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.contact !== undefined) updateData.phone = body.contact;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.cnicBForm !== undefined) updateData.cnicBForm = body.cnicBForm;
    if (body.address !== undefined) updateData.address = body.address;

    // courses object
    if (Object.keys(courses).length > 0 || body.csr !== undefined) {
      updateData.courses = {};

      if (courses.selectedCourse !== undefined)
        updateData.courses.selectedCourse = courses.selectedCourse;
      if (courses.batch !== undefined) updateData.courses.batch = courses.batch;
      if (courses.totalFees !== undefined)
        updateData.courses.totalFees = courses.totalFees;
      if (courses.downPayment !== undefined)
        updateData.courses.downPayment = courses.downPayment;
      if (courses.numberOfInstallments !== undefined)
        updateData.courses.numberOfInstallments = courses.numberOfInstallments;
      if (courses.feePerInstallment !== undefined)
        updateData.courses.feePerInstallment = courses.feePerInstallment;
      if (courses.amountPaid !== undefined)
        updateData.courses.amountPaid = courses.amountPaid;
      if (courses.SubmitFee !== undefined)
        updateData.courses.SubmitFee = courses.SubmitFee;
      if (courses.customPaymentMethod !== undefined)
        updateData.courses.customPaymentMethod = courses.customPaymentMethod;

      if (body.csr !== undefined) updateData.courses.csr = body.csr;
    }

    // Course-related fields - they all go inside courses object
    const courseUpdates = {};
    let hasCourseUpdates = false;

    if (body.course !== undefined) {
      courseUpdates.selectedCourse = body.course;
      hasCourseUpdates = true;
    }
    if (body.totalFees !== undefined) {
      courseUpdates.totalFees = body.totalFees;
      hasCourseUpdates = true;
    }
    if (body.feePaid !== undefined) {
      courseUpdates.amountPaid = body.feePaid; // feePaid -> amountPaid
      hasCourseUpdates = true;
    }
    if (body.feeRemaining !== undefined) {
      // Optional: You might want to calculate remaining or just store it
      // Since your schema doesn't have feeRemaining, you might skip or calculate
      // feeRemaining = totalFees - feePaid
    }
    if (body.installments !== undefined) {
      courseUpdates.numberOfInstallments = body.installments;
      hasCourseUpdates = true;
    }
    if (body.perInstallment !== undefined) {
      courseUpdates.feePerInstallment = body.perInstallment;
      hasCourseUpdates = true;
    }
    if (body.dueDate !== undefined) {
      // If you need to store dueDate in schema, add it
      // Currently schema doesn't have dueDate
    }

    // Payment method handling - MOST IMPORTANT
    if (body.paymentMethod !== undefined) {
      // Determine if custom payment method should be used
      if (body.paymentMethod === "Custom" && body.customPaymentMethod) {
        // If custom is selected and there's custom text, use custom text
        courseUpdates.SubmitFee = body.customPaymentMethod;
        courseUpdates.customPaymentMethod = body.customPaymentMethod;
      } else {
        // Otherwise use the selected payment method
        courseUpdates.SubmitFee = body.paymentMethod;
        // Clear customPaymentMethod if not custom
        courseUpdates.customPaymentMethod = "";
      }
      hasCourseUpdates = true;
    }

    // Also handle customPaymentMethod separately if sent
    if (body.customPaymentMethod !== undefined) {
      courseUpdates.customPaymentMethod = body.customPaymentMethod;
      hasCourseUpdates = true;
    }

    // If we have course updates, add them to updateData
    if (hasCourseUpdates) {
      updateData.courses = {
        ...updateData.courses,
        ...courseUpdates,
      };
    }

    console.log("✅ Processed updateData for PATCH:", updateData);

    // Use findByIdAndUpdate with $set to only update provided fields
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password"); // Exclude password from response

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    console.log("✅ Student updated successfully");
    return res.json({
      success: true,
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("❌ Error updating student:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
