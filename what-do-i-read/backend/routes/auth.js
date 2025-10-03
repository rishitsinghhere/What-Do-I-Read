const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const db = getDB();
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // CRITICAL: Ensure 'id' is a string before inserting, as it's used as your primary identifier
    const newUser = {
      id: new Date().getTime().toString(), // Custom string ID
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      savedBooks: [],
      playlists: [],
    };

    await db.collection("users").insertOne(newUser);

    // Use the custom 'id' for the JWT payload as requested
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // *** FIX: Clone the object before deleting properties ***
    const userToReturn = { ...newUser }; // Create a shallow copy
    delete userToReturn.password; // Now safe to delete

    res.status(201).json({ token, user: userToReturn });
  } catch (err) {
    console.error("REGISTER ERROR:", err); // Ensure JWT_SECRET is set in .env if this error still occurs
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in .env file");
    }

    // Use the custom 'id' for the JWT payload as requested
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // *** FIX: Clone the object before deleting properties ***
    const userToReturn = { ...user }; // Create a shallow copy
    delete userToReturn.password; // Now safe to delete
    // You might also want to delete the MongoDB _id field to keep the response clean
    delete userToReturn._id;

    res.json({ token, user: userToReturn });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
