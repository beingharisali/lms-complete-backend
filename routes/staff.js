const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  createStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  uploadFields,
} = require("../controllers/staff");

// All routes require authentication
router.use(authenticateUser);

// Routes
router.route("/").get(getAllStaff).post(uploadFields, createStaff);

router.route("/stats").get(getStaffStats);

router
  .route("/:id")
  .get(getStaff)
  .patch(uploadFields, updateStaff)
  .delete(deleteStaff);

module.exports = router;
