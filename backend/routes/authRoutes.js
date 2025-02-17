const express = require("express");
const { register, login, logout, getUsers,exportUsersToExcel, importUsersFromExcel} = require("../controllers/authController");
const multer = require("multer");

const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files in 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original file name
    }
});

const upload = multer({ storage: storage });

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getUsers);
router.get("/export-users", exportUsersToExcel);
router.post("/import-users", upload.single("file"), importUsersFromExcel);

module.exports = router;
