
const mongoose = require("mongoose");
 const ImageSchema = new mongoose.Schema({ 
  Image_Url: { type: String, required: true }, 
  fileName: { type: String, required: true, }, 
  fileType: { type: String, enum: ["zip", "image", "video"],required: true, }, 
  uploadedBy: { type: String, }, }, 
  { timestamps: true }); 
  module.exports = mongoose.model("Image", ImageSchema);