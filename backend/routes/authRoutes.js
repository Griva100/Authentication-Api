const express = require("express");
const { register, login, logout, getUsers, getProfile, updateProfile, exportUsersToExcel, importUsersFromExcel } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Ensure uploads/profile directory exists
const profileDir = path.join(__dirname, "../uploads/profile");
if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check if the file field is 'avatar' then store in uploads/profile
        if (file.fieldname === "avatar") {
            cb(null, "uploads/profile");
        } else {
            cb(null, "uploads/"); // Save files in 'uploads' directory
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use original file name
    }
});

const upload = multer({
    storage: storage, limits: { fileSize: 5 * 1024 * 1024 } // max file size 5MB
});

// router.post("/register", register);
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", authMiddleware, getUsers);
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", upload.single("avatar"), authMiddleware, updateProfile);
router.get("/export-users", authMiddleware, exportUsersToExcel);
router.post("/import-users", upload.single("file"), authMiddleware, importUsersFromExcel);

module.exports = router;
