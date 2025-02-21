const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ExcelJS = require("exceljs");
// const fs = require("fs");
const CryptoJS = require("crypto-js");

const encryptionKey = 'my-strong-secret-key-1234';

// AES encryption function
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
};

// AES decryption function
const decryptData = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, encryptionKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

exports.register = async (req, res) => {
  try {
    const decryptedBody = decryptData(req.body.data);
    const { name, email, password } = decryptedBody;

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
    const decryptedBody = decryptData(req.body.data);
    const { email, password } = decryptedBody;

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
    const encryptedUsers = encryptData(users);

    res.json({
      users: encryptedUsers,
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
      return res.status(404).json({ encryptedData: encryptData(JSON.stringify({ message: "No users found" })) });
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

    // // Set response headers
    // res.setHeader(
    //   "Content-Type",
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=users.xlsx"
    // );

    // // Write to response
    // await workbook.xlsx.write(res);
    // res.end();

    // Convert workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Encrypt the buffer data
    const encryptedData = encryptData(buffer.toString("base64"));

    res.json({ encryptedData }); // Send encrypted Excel data
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.importUsersFromExcel = async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ message: "No file uploaded" });
    // }

    // Decrypt the file data if sent in encrypted form
    const { encryptedData } = req.body;
    if (!encryptedData) {
      return res.status(400).json({ message: "Missing encrypted file data" });
    }

    const decryptedData = decryptData(encryptedData);
    if (!decryptedData) {
      return res.status(400).json({ message: "Decryption failed" });
    }

    // //Read uploaded Excel file
    // const filePath = req.file.path;
    // console.log(filePath);

    // if (!filePath.endsWith(".xlsx") && !filePath.endsWith(".xls")) {
    //   fs.unlinkSync(filePath);
    //   return res.status(400).json({ message: "Invalid file format. Please upload an Excel file." });
    // }

    // const workbook = xlsx.readFile(tempFilePath);
    // const sheetName = workbook.SheetNames[0];
    // const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // console.log("Parsed Data:", data); //  Debug parsed data

    // const usersToInsert = [];
    const importedUsers = [];
    const errors = [];

    // Regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*~_]).{6,}$/;

    for (const [index, row] of decryptedData.entries()) {
      let { name, email, password } = row;

      // Collect validation errors instead of stopping execution
      if (!name || !email || !password) {
        errors.push(`Row ${index + 2}: Missing required fields (name, email, or password).`);
        continue;
      }

      if (!emailRegex.test(email)) {
        errors.push(`Row ${index + 2}: Invalid email format (${email}).`);
        continue;
      }

      if (!passwordRegex.test(password)) {
        errors.push(`Row ${index + 2}: Password must be at least 6 characters long, contain at least one uppercase letter, and one special character (!@#$%^&*~_).`);
        continue;
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        errors.push(`Row ${index + 2}: User with email ${email} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.createUser(name, email, hashedPassword);
      importedUsers.push({ name, email, password: hashedPassword });
      // usersToInsert.push({ name, email, password: hashedPassword });
    }
    console.log("Users to Insert:", importedUsers); //  Debug before inserting

    // Insert users into the database
    // if (importedUsers.length > 0) {
    // await User.insertMany(importedUsers);
    // }
    // fs.unlinkSync(filePath); // Delete the uploaded file
    res.status(201).json({
      message: "Users imported successfully", importedUsers, errors, // Return all errors
    });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Server error" });
  }
};