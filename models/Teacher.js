const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TeacherSchema = new mongoose.Schema(
  {
    // Authentication fields
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
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    role: {
      type: String,
      default: "teacher",
      enum: ["teacher"],
      immutable: true, // Prevents role modification after creation
    },

    // Basic Information
    photo: {
      type: String, // Will store file path/URL
      default: null,
    },
    teacherId: {
      type: String,
      required: [true, "Please provide teacher ID"],
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
    cnic: {
      type: String,
      required: [true, "Please provide CNIC number"],
      unique: true,
      match: [
        /^[0-9]{13}$/,
        "Please provide a valid 13-digit CNIC number without dashes",
      ],
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
      maxlength: 200,
    },

    // Qualification Information
    qualification: {
      degree: {
        type: String,
        required: [true, "Please provide degree"],
        maxlength: 100,
      },
      institute: {
        type: String,
        required: [true, "Please provide institute name"],
        maxlength: 150,
      },
      passingYear: {
        type: Number,
        required: [true, "Please provide passing year"],
        min: 1950,
        max: new Date().getFullYear(),
      },
      obtainedCGPA: {
        type: Number,
        required: [true, "Please provide obtained CGPA"],
        min: 0,
        max: 4.0,
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
      cnicDocument: {
        type: String, // File path/URL
        default: null,
      },
      degreeDocument: {
        type: String, // File path/URL
        default: null,
      },
      cvDocument: {
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
      enum: ["Active", "Inactive", "On Leave", "Terminated"],
      default: "Active",
    },

    // Track who created this teacher (admin user ID)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
TeacherSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
TeacherSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Virtual for full name
TeacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
TeacherSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password; // Remove password from JSON output
    return ret;
  },
});

module.exports = mongoose.model("Teacher", TeacherSchema);
