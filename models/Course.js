const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    // Course Image
    courseImage: {
      type: String,
      default: null,
    },

    // Basic Course Information
    courseId: {
      type: String,
      required: [true, "Please provide course ID"],
      unique: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, "Please provide course name"],
      minlength: 3,
      maxlength: 150,
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Please provide course duration"],
      trim: true,
    },

    // Student Information
    noOfStudentsEnrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
    certifiedStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    freezedStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Lecture Information
    totalLectures: {
      type: Number,
      required: [true, "Please provide total number of lectures"],
      min: 0,
    },
    lecturesDelivered: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Instructor Information (Reference to Teacher)
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Please assign an instructor to this course"],
    },
    instructorName: {
      type: String,
      required: [true, "Please provide instructor name"],
    },
    instructorEmail: {
      type: String,
      required: [true, "Please provide instructor email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide phone number"],
      match: [/^[0-9+\-\s\(\)]{10,15}$/, "Please provide a valid phone number"],
    },

    // Course Description
    description: {
      type: String,
      required: [true, "Please provide course description"],
      maxlength: 1000,
    },

    // Status
    status: {
      type: String,
      enum: ["Active", "Inactive", "Completed", "Upcoming"],
      default: "Active",
    },

    // Track who created this course (admin user ID)
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

// Index for faster searches
CourseSchema.index({ courseName: 1 });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ status: 1 });

// Virtual for lecture progress percentage
CourseSchema.virtual("lectureProgress").get(function () {
  if (this.totalLectures === 0) return 0;
  return ((this.lecturesDelivered / this.totalLectures) * 100).toFixed(2);
});

// Virtual for certification rate
CourseSchema.virtual("certificationRate").get(function () {
  if (this.noOfStudentsEnrolled === 0) return 0;
  return ((this.certifiedStudents / this.noOfStudentsEnrolled) * 100).toFixed(
    2
  );
});

// Ensure virtual fields are serialized
CourseSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Course", CourseSchema);
