const Quiz = require("../models/Quiz");

// Create quiz
const createQuiz = async (req, res) => {
  try {
    const { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;
    let filePath = null;

    if (req.file) {
      filePath = req.file.path;
    }

    const quiz = await Quiz.create({
      title,
      description,
      validTill,
      totalMarks,
      allowMultiple,
      file: filePath,
      questions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single quiz
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;

    let updateData = { title, description, validTill, totalMarks, allowMultiple, questions };

    if (req.file) {
      updateData.file = req.file.path;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuiz) return res.status(404).json({ message: "Quiz not found" });

    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createQuiz, getQuizzes, getQuizById, updateQuiz, deleteQuiz };
