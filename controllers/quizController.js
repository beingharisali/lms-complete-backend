const Quiz = require("../models/Quiz");

// @desc   Create a new quiz
// @route  POST /api/quizzes
const createQuiz = async (req, res) => {
  try {
    const { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;
    let filePath = null;

    if (req.file) {
      filePath = req.file.path; // multer saves file path
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

// @desc   Get all quizzes
// @route  GET /api/quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single quiz by id
// @route  GET /api/quizzes/:id
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update quiz
// @route  PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
  try {
    const { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;

    let updateData = {
      title,
      description,
      validTill,
      totalMarks,
      allowMultiple,
      questions,
    };

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

// @desc   Delete quiz
// @route  DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};
