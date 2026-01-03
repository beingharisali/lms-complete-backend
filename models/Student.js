const mongoose = require("mongoose");



const CourseSchema = new mongoose.Schema({
  selectedCourse: { type: String, required: true },
  csr: { type: String, required: true },
  totalFees: { type: Number, required: true },
  numberOfInstallments: { type: Number, default: 1 },
  feePerInstallment: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  enrolledDate: { type: Date, default: Date.now },

  SubmitFee: { type: String, required: true },
  customPaymentMethod: { type: String },
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
    courses: CourseSchema,
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
