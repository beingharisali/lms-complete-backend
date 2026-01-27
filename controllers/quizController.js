const Quiz = require("../models/Quiz");


const createQuiz = async (req, res) => {
  try {
    let { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;
    let filePath = null;

    if (req.file) {
      filePath = req.file.path;
    }

    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return res.status(400).json({ message: "Invalid questions format" });
      }
    }
    allowMultiple = allowMultiple === "true" || allowMultiple === true;
    totalMarks = Number(totalMarks);

    const quiz = await Quiz.create({
      title,
      description,
      validTill,
      totalMarks,
      allowMultiple,
      file: filePath,
      questions,
    });

    res.status(201).json({ quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: error.message });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateQuiz = async (req, res) => {
  try {
    let { title, description, validTill, totalMarks, allowMultiple, questions } = req.body;

    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return res.status(400).json({ message: "Invalid questions format" });
      }
    }


    allowMultiple = allowMultiple === "true" || allowMultiple === true;
    totalMarks = Number(totalMarks);

    const updateData = {
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

    res.json({ quiz: updatedQuiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: error.message });
  }
};


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
