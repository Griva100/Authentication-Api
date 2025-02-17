const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ExcelJS = require("exceljs");
const fs = require("fs");
const xlsx = require("xlsx");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // let user = await User.findOne({ email });
    let user = await User.findByEmail(email);
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // user = new User({ name, email, password: hashedPassword });
    // await user.save();
    await User.createUser(name, email, hashedPassword);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // const user = await User.findOne({ email });
    const user = await User.findByEmail(email);
    // const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Logout successful" });
};

exports.getUsers = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;

    const { users, totalUsers } = await User.getUsersPaginated(page, limit);
    res.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.exportUsersToExcel = async (req, res) => {
  try {
    const users = await User.getAllUsers(); // Fetch all users

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 }
    ];

    // Add user data to worksheet
    users.forEach(user => {
      worksheet.addRow(user);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users.xlsx"
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Validation Function
// const validateUserInput = (name, email, password) => {
//   const nameRegex = /^[A-Za-z]{3,}$/;
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*~_]).{6,}$/;

//   if (!name || !nameRegex.test(name)) {
//     return "Invalid name: At least 3 characters, only letters allowed.";
//   }
//   if (!email || !emailRegex.test(email)) {
//     return "Invalid email format.";
//   }
//   if (!password || !passwordRegex.test(password)) {
//     return "Invalid password: Must be at least 6 characters, contain one uppercase letter and one special character (!@#$%^&*~_).";
//   }
//   return null;
// };

exports.importUsersFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read uploaded Excel file
    const filePath = req.file.path;
    console.log(filePath);
    if (!filePath.endsWith(".xlsx") && !filePath.endsWith(".xls")) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Invalid file format. Please upload an Excel file." });
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Parsed Data:", data); //  Debug parsed data

    const usersToInsert = [];

    for (const row of data) {
      const { name, email, password } = row;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Invalid file format. Name, email, and password are required." });
      }

      // // Validate user input
      // const validationError = validateUserInput(name, email, password);
      // if (validationError) {
      //   return res.status(400).json({ message: `Error in row ${row}: ${validationError}` });
      // }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: `User with email ${email} already exists.` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.createUser(name, email, hashedPassword);
      // usersToInsert.push({ name, email, password: hashedPassword });
    }
    // console.log("Users to Insert:", usersToInsert); // ✅ Debug before inserting

    // Insert users into the database
    // await User.insertMany(usersToInsert);

    fs.unlinkSync(filePath); // Delete the uploaded file
    res.status(201).json({ message: "Users imported successfully" });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Server error" });
  }
};