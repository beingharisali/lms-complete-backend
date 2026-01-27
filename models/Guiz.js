const mongoose = require("mongoose");

const guizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    validTill: { type: Date, required: true },
    allowedTime: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    multipleSubmissions: { type: Boolean, default: false },
//    question: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guiz", guizSchema);
