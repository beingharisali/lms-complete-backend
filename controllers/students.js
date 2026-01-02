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
    const safeParse = (v) => {
      if (!v) return undefined;
      try {
        return typeof v === "string" ? JSON.parse(v) : v;
      } catch {
        return v;
      }
    };

    const courses = safeParse(body.courses) || {};
    const parentGuardian = safeParse(body.parentGuardian) || {};
    const emergencyContact = safeParse(body.emergencyContact) || {};

    const updateData = {};

    if (body.name !== undefined) updateData.fullName = body.name; // name -> fullName
    if (body.studentId !== undefined) updateData.studentId = body.studentId;
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.dateOfBirth !== undefined)
      updateData.dateOfBirth = body.dateOfBirth;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.contact !== undefined) updateData.phone = body.contact; // contact -> phone
    if (body.email !== undefined) updateData.email = body.email;
    if (body.cnicBForm !== undefined) updateData.cnicBForm = body.cnicBForm;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.csr !== undefined) updateData.csr = body.csr;

    // courses sub-object mapping (map keys from frontend to your schema)
    if (Object.keys(courses).length > 0) {
      updateData.courses = {
        ...(courses.selectedCourse !== undefined && {
          selectedCourse: courses.selectedCourse,
        }),
        ...(courses.batch !== undefined && { batch: courses.batch }),
        ...(courses.totalFees !== undefined && {
          totalFees: courses.totalFees,
        }),
        ...(courses.downPayment !== undefined && {
          downPayment: courses.downPayment,
        }),
        ...(courses.numberOfInstallments !== undefined && {
          numberOfInstallments: courses.numberOfInstallments,
        }),
        ...(courses.feePerInstallment !== undefined && {
          feePerInstallment: courses.feePerInstallment,
        }),
        ...(courses.amountPaid !== undefined && {
          amountPaid: courses.amountPaid,
        }),
        ...(courses.SubmitFee !== undefined && {
          SubmitFee: courses.SubmitFee,
        }),
        ...(courses.customPaymentMethod !== undefined && {
          customPaymentMethod: courses.customPaymentMethod,
        }), 
      };
    }

    if (body.course !== undefined) {
      updateData.courses = updateData.courses || {};
      updateData.courses.selectedCourse = body.course;
    }
    if (body.totalFees !== undefined) {
      updateData.courses = updateData.courses || {};
      updateData.courses.totalFees = body.totalFees;
    }
    if (body.feePaid !== undefined) {
      updateData.courses = updateData.courses || {};
      // you may want to store this as amountPaid depending on schema
      updateData.courses.amountPaid = body.feePaid;
    }
    if (body.installments !== undefined) {
      updateData.courses = updateData.courses || {};
      updateData.courses.numberOfInstallments = body.installments;
    }
    if (body.perInstallment !== undefined) {
      updateData.courses = updateData.courses || {};
      updateData.courses.feePerInstallment = body.perInstallment;
    }

    // parentGuardian mapping
    if (Object.keys(parentGuardian).length > 0) {
      updateData.parentGuardian = {
        ...(parentGuardian.name !== undefined && { name: parentGuardian.name }),
        ...(parentGuardian.phone !== undefined && {
          phone: parentGuardian.phone,
        }),
      };
    }
    // emergencyContact mapping
    if (Object.keys(emergencyContact).length > 0) {
      updateData.emergencyContact = {
        ...(emergencyContact.name !== undefined && {
          name: emergencyContact.name,
        }),
        ...(emergencyContact.relationship !== undefined && {
          relationship: emergencyContact.relationship,
        }),
        ...(emergencyContact.phoneNumber !== undefined && {
          phoneNumber: emergencyContact.phoneNumber,
        }),
      };
    }

    // password handling
    if (body.password) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // 4) Handle file uploads (if any)
    if (req.files) {
      if (req.files.photo)
        updateData.photo = req.files.photo[0].path.replace(/\\/g, "/");
      if (req.files.studentCnicBForm)
        updateData.studentCnicBForm =
          req.files.studentCnicBForm[0].path.replace(/\\/g, "/");
      if (req.files.parentCnic)
        updateData.parentCnic = req.files.parentCnic[0].path.replace(
          /\\/g,
          "/"
        );
      if (req.files.medicalRecords)
        updateData.medicalRecords = req.files.medicalRecords[0].path.replace(
          /\\/g,
          "/"
        );
      if (req.files.additionalDocuments)
        updateData.additionalDocuments =
          req.files.additionalDocuments[0].path.replace(/\\/g, "/");
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
