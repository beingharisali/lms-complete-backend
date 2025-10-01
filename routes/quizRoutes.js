const express = require("express");
const multer = require("multer");
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

const router = express.Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files inside /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// CRUD routes
router.post("/", upload.single("file"), createQuiz);
router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.put("/:id", upload.single("file"), updateQuiz);
router.delete("/:id", deleteQuiz);

module.exports = router;
