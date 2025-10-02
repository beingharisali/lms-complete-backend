const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");

const { register, login, getProfile, logout } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authenticateUser, getProfile);

router.post("/logout", authenticateUser, logout);

module.exports = router;
