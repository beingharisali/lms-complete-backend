
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const resourceController = require("../controllers/resourceController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
router.post("/", upload.single("file"), resourceController.createResource);
router.get("/", resourceController.getAllResources);
router.delete("/:id", resourceController.deleteResource);
router.patch("/:id/deactivate", resourceController.deactivateResource);

module.exports = router;
