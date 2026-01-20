
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");
const Image = require("../models/uploadfile");

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET_KEY
});

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: " file not uploaded" });
    }

    const filePath = req.file.path;
    console.log("file path", filePath);

    const ext = path.extname(req.file.originalname).toLowerCase();

    let resourceType;
    let fileType;

    if (ext === ".zip") {
      resourceType = "raw";
      fileType = "zip";
    } else if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
      resourceType = "image";
      fileType = "image";
    } else {
      return res.status(400).json({ msg: "file type support nhi kr rhi ye" });
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder: "uploads",
    });

  
    const newImage = new Image({
      Image_Url: result.secure_url,
      fileName: req.file.originalname,
      fileType,
      uploadedBy: req.body.uploadedBy || "Anonymous",
    });

    await newImage.save();


    fs.unlink(filePath, (err) => {
      if (err) console.log("Error deleted file ka", err);
      else console.log("file deleted");
    });

    res.status(200).json({
      msg: "File uploaded successfully",
      image_url: result.secure_url,
      fileName: req.file.originalname,
      fileType,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadFile };
