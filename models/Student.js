const mongoose = require("mongoose");

const ParentGuardianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

const CourseSchema = new mongoose.Schema({
  selectedCourse: { type: String, required: true },
  batch: { type: String },
  totalFees: { type: Number, required: true },
  downPayment: { type: Number, default: 0 },
  numberOfInstallments: { type: Number, default: 1 },
  feePerInstallment: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  enrolledDate: { type: Date, default: Date.now },
});

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cnicBForm: { type: String, required: true },
    address: { type: String, required: true },

    // ✅ New CSR field (reference or text)
    csr: {
      type: String, // you can make this ObjectId if linking to User model
      required: false,
    },

    parentGuardian: ParentGuardianSchema,
    courses: CourseSchema,
    emergencyContact: EmergencyContactSchema,

    // Files
    photo: { type: String },
    studentCnicBForm: { type: String },
    parentCnic: { type: String },
    medicalRecords: { type: String },
    additionalDocuments: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);




// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const studentSchema = new mongoose.Schema({
//   firstName: String,
//   lastName: String,
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, default: "student" },
//   // ...your other fields
// });

// // ✅ Add comparePassword method
// studentSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // ✅ Hash password before saving
// studentSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// const Student = mongoose.model("Student", studentSchema);

// module.exports = Student;
