const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Login Controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2️⃣ Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Generate JWT
   const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    operatorId: user.operatorId || null,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }
);

    // 5️⃣ Send response
   res.status(200).json({
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
    operatorId: user.operatorId || null,
  },
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
};