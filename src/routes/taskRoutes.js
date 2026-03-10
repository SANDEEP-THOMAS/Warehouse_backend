const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  createTask,
  getTasks,
  updateTask,
} = require("../controllers/taskController");
// const { deleteOperator } = require("../controllers/operatorController");

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.patch("/:id", protect, updateTask);


module.exports = router;