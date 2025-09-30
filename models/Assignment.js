const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["short", "mcq"],
    default: "short",
  },
  question: { type: String, required: true },
  answer: { type: String },
  options: [{ type: String }], // MCQs only
});

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    file: { type: String }, // uploaded file path
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
