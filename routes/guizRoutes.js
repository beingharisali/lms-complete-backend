const express = require("express");
const router = express.Router();
const {
  createGuiz,
  getGuizes,
  getGuizById,
  updateGuiz,
  deleteGuiz,
} = require("../controllers/guizController");

// CRUD endpoints
router.post("/", createGuiz);
router.get("/", getGuizes);
router.get("/:id", getGuizById);
router.put("/:id", updateGuiz);
router.delete("/:id", deleteGuiz);

module.exports = router;
