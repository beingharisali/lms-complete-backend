const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      maxlength: 50,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Please provide gender"],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      match: [
        /^[\+]?[0-9\s\-\(\)]{8,20}$/,
        "Please provide a valid phone number",
      ],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    cnic: {
      type: String,
      required: [true, "Please provide CNIC"],
      match: [/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Please provide a valid CNIC"],
      unique: true,
    },
    address: {
      type: String,
      required: [true, "Please provide address"],
      maxlength: 200,
    },

    // Qualification
    qualification: {
      education: {
        type: String,
        required: [true, "Please provide education"],
        maxlength: 100,
      },
      institute: {
        type: String,
        required: [true, "Please provide institute name"],
        maxlength: 100,
      },
      yearOfPassing: {
        type: Number,
        required: [true, "Please provide year of passing"],
        min: 1950,
        max: new Date().getFullYear(),
      },
      designation: {
        type: String,
        required: [true, "Please provide designation"],
        maxlength: 50,
      },
    },

    // Emergency Contact
    emergencyContact: {
      name: {
        type: String,
        required: [true, "Please provide emergency contact name"],
        maxlength: 50,
      },
      relationship: {
        type: String,
        required: [true, "Please provide relationship"],
        maxlength: 30,
      },
      phoneNumber: {
        type: String,
        required: [true, "Please provide emergency phone number"],
        match: [
          /^[\+]?[0-9\s\-\(\)]{8,20}$/,
          "Please provide a valid phone number",
        ],
      },
    },

    // Authorities Table (Permissions)
    authorities: {
      students: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
      courses: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
      fees: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
      instructorPayment: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
      admissionForm: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
      visitorForm: {
        review: { type: Boolean, default: false },
        add: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
      },
    },

    // Related Documents
    relatedDocuments: {
      cnicDocument: {
        type: String,
        default: "",
      },
      medicalRecords: {
        type: String,
        default: "",
      },
      additionalDocuments: {
        type: String,
        default: "",
      },
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Terminated"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", StaffSchema);
