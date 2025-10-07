// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const StudentSchema = new mongoose.Schema(
//   {
//     // Authentication fields
//     email: {
//       type: String,
//       required: [true, "Please provide email"],
//       match: [
//         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//         "Please provide a valid email",
//       ],
//       unique: true,
//       lowercase: true,
//     },
//     password: {
//       type: String,
//       required: [true, "Please provide password"],
//       minlength: 6,
//     },
//     role: {
//       type: String,
//       default: "student",
//       enum: ["student"],
//       immutable: true, // Prevents role modification after creation
//     },

//     // Basic Information
//     photo: {
//       type: String, // Will store file path/URL
//       default: null,
//     },
//     studentId: {
//       type: String,
//       required: [true, "Please provide student ID"],
//       unique: true,
//       trim: true,
//     },
//     firstName: {
//       type: String,
//       required: [true, "Please provide first name"],
//       minlength: 2,
//       maxlength: 50,
//       trim: true,
//     },
//     lastName: {
//       type: String,
//       required: [true, "Please provide last name"],
//       minlength: 2,
//       maxlength: 50,
//       trim: true,
//     },
//     dateOfBirth: {
//       type: Date,
//       required: [true, "Please provide date of birth"],
//     },
//     gender: {
//       type: String,
//       required: [true, "Please provide gender"],
//       enum: ["Male", "Female", "Other"],
//     },
//     phone: {
//       type: String,
//       required: [true, "Please provide phone number"],
//       match: [/^[0-9+\-\s\(\)]{10,15}$/, "Please provide a valid phone number"],
//     },
//     cnicBForm: {
//       type: String,
//       required: [true, "Please provide CNIC/B-Form number"],
//       unique: true,
//       match: [/^[0-9+\-]{13,17}$/, "Please provide a valid CNIC/B-Form number"],
//     },
//     address: {
//       type: String,
//       required: [true, "Please provide address"],
//       maxlength: 200,
//     },

//     // Parent/Guardian Information
//     parentGuardian: {
//       name: {
//         type: String,
//         required: [true, "Please provide parent/guardian name"],
//         maxlength: 100,
//       },
//       phone: {
//         type: String,
//         required: [true, "Please provide parent/guardian phone"],
//         match: [
//           /^[0-9+\-\s\(\)]{10,15}$/,
//           "Please provide a valid phone number",
//         ],
//       },
//       email: {
//         type: String,
//         required: [true, "Please provide parent/guardian email"],
//         match: [
//           /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//           "Please provide a valid email",
//         ],
//         lowercase: true,
//       },
//       cnic: {
//         type: String,
//         required: [true, "Please provide parent/guardian CNIC"],
//         match: [/^[0-9+\-]{13,17}$/, "Please provide a valid CNIC number"],
//       },
//     },

//     // Course Information
//     courses: {
//       selectedCourse: {
//         type: String,
//         required: [true, "Please select a course"],
//       },
//       totalFees: {
//         type: Number,
//         required: [true, "Please provide total fees"],
//         min: 0,
//       },
//       downPayment: {
//         type: Number,
//         required: [true, "Please provide down payment"],
//         min: 0,
//       },
//       numberOfInstallments: {
//         type: Number,
//         required: [true, "Please provide number of installments"],
//         min: 1,
//       },
//       feePerInstallment: {
//         type: Number,
//         required: [true, "Please provide fee per installment"],
//         min: 0,
//       },
//       amountPaid: {
//         type: Number,
//         default: 0,
//         min: 0,
//       },
//       enrolledDate: {
//         type: Date,
//         required: [true, "Please provide enrolled date"],
//       },
//     },

//     // Emergency Contact
//     emergencyContact: {
//       name: {
//         type: String,
//         required: [true, "Please provide emergency contact name"],
//         maxlength: 100,
//       },
//       relationship: {
//         type: String,
//         required: [true, "Please provide relationship"],
//         maxlength: 50,
//       },
//       phoneNumber: {
//         type: String,
//         required: [true, "Please provide emergency contact phone"],
//         match: [
//           /^[0-9+\-\s\(\)]{10,15}$/,
//           "Please provide a valid phone number",
//         ],
//       },
//     },

//     // Related Documents (file paths/URLs)
//     relatedDocuments: {
//       studentCnicBForm: {
//         type: String, // File path/URL
//         default: null,
//       },
//       parentCnic: {
//         type: String, // File path/URL
//         default: null,
//       },
//       medicalRecords: {
//         type: String, // File path/URL
//         default: null,
//       },
//       additionalDocuments: {
//         type: String, // File path/URL
//         default: null,
//       },
//     },

//     // Status
//     status: {
//       type: String,
//       enum: ["Active", "Inactive", "Graduated", "Suspended"],
//       default: "Active",
//     },

//     // Track who created this student (admin user ID)
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Hash password before saving
// StudentSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// // Method to compare password
// StudentSchema.methods.comparePassword = async function (candidatePassword) {
//   const isMatch = await bcrypt.compare(candidatePassword, this.password);
//   return isMatch;
// };

// // Virtual for full name
// StudentSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

// // Ensure virtual fields are serialized
// StudentSchema.set("toJSON", {
//   virtuals: true,
//   transform: function (doc, ret) {
//     delete ret.password; // Remove password from JSON output
//     return ret;
//   },
// });

// module.exports = mongoose.model("Student", StudentSchema);



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
