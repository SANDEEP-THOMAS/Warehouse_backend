const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(protect);

// GET /api/tasks - Admin, Supervisor, Operator
router.get("/", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), getTasks);

// POST /api/tasks - Admin & Supervisor
router.post("/", authorize("ADMIN", "SUPERVISOR"), createTask);

// PATCH /api/tasks/:id - Admin, Supervisor, Operator
router.patch("/:id", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), updateTask);

// DELETE /api/tasks/:id - Admin only
router.delete("/:id", authorize("ADMIN"), deleteTask);

module.exports = router;