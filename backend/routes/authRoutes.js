const express = require("express");
const { register, login, logout, getUsers,exportUsersToExcel} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getUsers);
router.get("/export-users", exportUsersToExcel);

module.exports = router;
