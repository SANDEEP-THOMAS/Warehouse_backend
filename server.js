require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./src/models/userModel");
const ROLES = require("./src/constants/roles");

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// 🔐 Bootstrap Admin Function
const bootstrapAdmin = async () => {
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log("No users found. Creating initial admin...");

      const hashedPassword = await bcrypt.hash(
        process.env.INITIAL_ADMIN_PASSWORD,
        10
      );

      await User.create({
        name: process.env.INITIAL_ADMIN_NAME,
        username: process.env.INITIAL_ADMIN_USERNAME,
        password: hashedPassword,
        role: ROLES.ADMIN,
      });

      console.log("Initial admin created successfully");
    } else {
      console.log("Users already exist. Skipping admin creation.");
    }
  } catch (error) {
    console.error("Error during admin bootstrap:", error.message);
  }
};

// 🚀 Start Server
const startServer = async () => {
  try {
    await connectDB();          // 1️⃣ Connect DB
    await bootstrapAdmin();     // 2️⃣ Create admin if needed

    app.listen(PORT, () => {    // 3️⃣ Start server
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();