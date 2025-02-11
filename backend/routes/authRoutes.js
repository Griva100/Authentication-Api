const express = require("express");
const { register, login, logout, getUsers} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getUsers);

module.exports = router;
