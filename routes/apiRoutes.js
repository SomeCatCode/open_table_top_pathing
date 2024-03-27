// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");

// User registration TODO: Implement registration
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login TODO: Implement login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const token = jwt.sign({ userId: 1 }, config.jwt.Secret, {
      expiresIn: config.jwt.TTL,
    });
    
    res.status(200).json({
      access_token: token,
      token_type: "Bearer",
      expires_in: config.jwt.TTL,
    });

    // const user = await User.findOne({ username });
    // if (!user) {
    //   return res.status(401).json({ error: "Authentication failed" });
    // }
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(401).json({ error: "Authentication failed" });
    // }
    // const token = jwt.sign({ userId: user._id }, config.jwt.Secret, {
    //   expiresIn:   config.jwt.TTL ,
    // });
    // res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
