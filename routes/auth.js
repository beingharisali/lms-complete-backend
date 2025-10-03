const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const { register, login, getProfile } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateUser, getProfile);

module.exports = router;
