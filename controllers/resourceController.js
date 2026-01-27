const Resource = require("../models/Resource");

exports.createResource = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    let fileUrl = "";

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const newResource = new Resource({
      title,
      description,
      link,
      fileUrl,
      status: "Active",
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Resource.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Resource not found" });

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deactivateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Resource.findByIdAndUpdate(
      id,
      { status: "Inactive" },
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ message: "Resource not found" });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
