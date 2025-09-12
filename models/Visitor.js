const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please provide user name"],
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      lowercase: true,
      trim: true,
    },
    // Optional: Add status field for lead management
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Not Interested", "Converted"],
      default: "New",
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better performance on email searches
VisitorSchema.index({ email: 1 });
VisitorSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Visitor", VisitorSchema);
