const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("dev"));

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Warehouse Workforce API is running",
  });
});

module.exports = app;