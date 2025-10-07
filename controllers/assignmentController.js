

const Assignment = require("../models/Assignment");

// CREATE
const createAssignment = async (req, res) => {
  try {
    // ✅ Parse questions if sent as JSON string
    if (req.body.questions) {
      try {
        req.body.questions = JSON.parse(req.body.questions);
      } catch (err) {
        return res.status(400).json({ error: "Invalid questions format" });
      }
    }

    const { title, description, dueDate, questions } = req.body;
    const file = req.file ? req.file.filename : null;

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      file,
      questions,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// READ all
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ single
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE (PUT)
const updateAssignment = async (req, res) => {
  try {
    // ✅ Parse questions if sent as JSON string
    if (req.body.questions) {
      try {
        req.body.questions = JSON.parse(req.body.questions);
      } catch (err) {
        return res.status(400).json({ error: "Invalid questions format" });
      }
    }

    const { title, description, dueDate, questions } = req.body;
    const file = req.file ? req.file.filename : undefined;

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueDate, questions, ...(file && { file }) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH
const patchAssignment = async (req, res) => {
  try {
    // ✅ Parse questions if sent as JSON string
    if (req.body.questions) {
      try {
        req.body.questions = JSON.parse(req.body.questions);
      } catch (err) {
        return res.status(400).json({ error: "Invalid questions format" });
      }
    }

    const updates = { ...req.body };
    if (req.file) updates.file = req.file.filename;

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  patchAssignment,
  deleteAssignment,
};
