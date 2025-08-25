const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    // Basic Information
    photo: {
      type: String, // Will store file path/URL
      default: null,
    },
    studentId: {
      type: String,
      required: [true, "Please provide student ID"],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    gender: {
      type: String,
      required: [true, "Please provide gender"],
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      match: [/^[0-9+\-\s\(\)]{10,15}$/, "Please provide a valid phone number"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
      lowercase: true,
    },
    cnicBForm: {
      type: String,
      required: [true, "Please provide CNIC/B-Form number"],
      unique: true,
      match: [/^[0-9+\-]{13,17}$/, "Please provide a valid CNIC/B-Form number"],
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
      maxlength: 200,
    },

    // Parent/Guardian Information
    parentGuardian: {
      name: {
        type: String,
        required: [true, "Please provide parent/guardian name"],
        maxlength: 100,
      },
      phone: {
        type: String,
        required: [true, "Please provide parent/guardian phone"],
        match: [
          /^[0-9+\-\s\(\)]{10,15}$/,
          "Please provide a valid phone number",
        ],
      },
      email: {
        type: String,
        required: [true, "Please provide parent/guardian email"],
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please provide a valid email",
        ],
        lowercase: true,
      },
      cnic: {
        type: String,
        required: [true, "Please provide parent/guardian CNIC"],
        match: [/^[0-9+\-]{13,17}$/, "Please provide a valid CNIC number"],
      },
    },

    // Course Information
    courses: {
      selectedCourse: {
        type: String,
        required: [true, "Please select a course"],
      },
      totalFees: {
        type: Number,
        required: [true, "Please provide total fees"],
        min: 0,
      },
      downPayment: {
        type: Number,
        required: [true, "Please provide down payment"],
        min: 0,
      },
      numberOfInstallments: {
        type: Number,
        required: [true, "Please provide number of installments"],
        min: 1,
      },
      feePerInstallment: {
        type: Number,
        required: [true, "Please provide fee per installment"],
        min: 0,
      },
      amountPaid: {
        type: Number,
        default: 0,
        min: 0,
      },
      enrolledDate: {
        type: Date,
        required: [true, "Please provide enrolled date"],
      },
    },

    // Emergency Contact
    emergencyContact: {
      name: {
        type: String,
        required: [true, "Please provide emergency contact name"],
        maxlength: 100,
      },
      relationship: {
        type: String,
        required: [true, "Please provide relationship"],
        maxlength: 50,
      },
      phoneNumber: {
        type: String,
        required: [true, "Please provide emergency contact phone"],
        match: [
          /^[0-9+\-\s\(\)]{10,15}$/,
          "Please provide a valid phone number",
        ],
      },
    },

    // Related Documents (file paths/URLs)
    relatedDocuments: {
      studentCnicBForm: {
        type: String, // File path/URL
        default: null,
      },
      parentCnic: {
        type: String, // File path/URL
        default: null,
      },
      medicalRecords: {
        type: String, // File path/URL
        default: null,
      },
      additionalDocuments: {
        type: String, // File path/URL
        default: null,
      },
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated", "Suspended"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
StudentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
StudentSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Student", StudentSchema);
