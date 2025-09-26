const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "staff", "admin"],
      default: "student",
    },
    // Reference to the specific role document (Student, Teacher, or Staff)
    roleReference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "roleModel",
    },
    roleModel: {
      type: String,
      enum: ["Student", "Teacher", "Staff"],
      required: function () {
        return this.role !== "admin";
      },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  // Get the JWT_LIFETIME from environment variable or use default
  let expiresIn = process.env.JWT_LIFETIME;

  // If JWT_LIFETIME is not set or is empty, use default "30d"
  if (!expiresIn || expiresIn.trim() === "") {
    expiresIn = "30d";
  }

  // Remove any quotes that might be present
  expiresIn = expiresIn.replace(/['"]/g, "").trim();

  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
      role: this.role,
      roleReference: this.roleReference,
      roleModel: this.roleModel,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiresIn,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
