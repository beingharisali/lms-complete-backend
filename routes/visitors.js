const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const {
  createVisitor,
  getAllVisitors,
  getVisitor,
  updateVisitor,
  deleteVisitor,
  getVisitorStats,
  bulkUpdateVisitorStatus,
} = require("../controllers/visitors");

// All routes require authentication
router.use(authenticateUser);

// Routes
router.route("/").get(getAllVisitors).post(createVisitor);

router.route("/stats").get(getVisitorStats);

router.route("/bulk-update").patch(bulkUpdateVisitorStatus);

router.route("/:id").get(getVisitor).patch(updateVisitor).delete(deleteVisitor);

module.exports = router;
