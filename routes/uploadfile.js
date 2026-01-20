const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadFile } = require("../controllers/uploadController");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/recordings"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".zip" || ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
      cb(null, true);
    } else {
      cb(new Error("file type not correct"), false);
    }
  },
});

router.post("/", upload.single("myfile"), uploadFile);

router.get("/", async (req, res) => {
  try {
    const Image = require("../models/uploadfile");
    const files = await Image.find().sort({ createdAt: -1 });
    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed " });
  }
});

module.exports = router;
