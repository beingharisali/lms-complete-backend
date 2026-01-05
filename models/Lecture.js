const mongoose = require("mongoose");
 
const LectureSchema = new mongoose.Schema (
    {
    lectureNumber:{ type: Number, required: true, min: 1, max: 30},
    lectureDate:{ type: Date, required: true },
    },
      { timestamps: true }  , 
);
module.exports = mongoose.model("Lecture", LectureSchema);