const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["short", "mcq"],
    required: true,
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  choices: [{ type: String }],
});

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    validTill: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    allowMultiple: { type: Boolean, default: false },
    file: { type: String },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
