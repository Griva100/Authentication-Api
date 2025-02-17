require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const {connectDB} = require("./config/db");

const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();
app.use(cors({
    origin: "http://localhost:3000", // Allow requests only from this origin
    credentials: true, // Allow cookies and authorization headers
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save file with its original name
    },
});
const upload = multer({ storage: storage });

// Middleware to serve static files
app.use(express.static("uploads"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
