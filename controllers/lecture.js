const Lecture = require("../models/Lecture");

const createLecture = async (req, res) => {
  try {
    const { lectureNumber, lectureDate } = req.body;
    if (!lectureNumber || !lectureDate) {
      return res.status(400).json({
        message: "Lecture number and date are required",
      });
    }
    const existingLecture = await Lecture.findOne({ lectureNumber });
    if (existingLecture) {
      return res.status(409).json({
        message: "This lecture number already exists",
      });
    }

    const lecture = new Lecture({
      lectureNumber,
      lectureDate,
    });

    await lecture.save();

    res.status(201).json({
      success: true,
      lecture,
    });
  } catch (error) {
    console.error("Create lecture error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find().sort({ lectureDate: 1 });

    res.status(200).json({
      success: true,
      lectures,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findByIdAndDelete(id);

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createLecture,
  getAllLectures,
  deleteLecture,
};
