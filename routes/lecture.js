const express = require("express");
const router = express.Router();

const {
  createLecture,
  getAllLectures,
  deleteLecture,
} = require("../controllers/lecture");

router.post("/", createLecture);
router.get("/", getAllLectures);
router.delete("/:id", deleteLecture);

module.exports = router;
