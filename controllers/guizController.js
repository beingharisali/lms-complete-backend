const Guiz = require("../models/Guiz");


exports.createGuiz = async (req, res) => {
  try {
    const guiz = await Guiz.create(req.body);
    res.status(201).json(guiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getGuizes = async (req, res) => {
  try {
    const guizes = await Guiz.find();
    res.json(guizes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getGuizById = async (req, res) => {
  try {
    const guiz = await Guiz.findById(req.params.id);
    if (!guiz) return res.status(404).json({ message: "Guiz not found" });
    res.json(guiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGuiz = async (req, res) => {
  try {
    const guiz = await Guiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guiz) return res.status(404).json({ message: "Guiz not found" });
    res.json(guiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteGuiz = async (req, res) => {
  try {
    const guiz = await Guiz.findByIdAndDelete(req.params.id);
    if (!guiz) return res.status(404).json({ message: "Guiz not found" });
    res.json({ message: "Guiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
