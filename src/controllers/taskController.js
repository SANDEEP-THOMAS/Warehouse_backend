const Task = require("../models/taskModel");
const Operator = require("../models/operatorModel");
const ROLES = require("../constants/roles");

// ================= CREATE TASK =================
const createTask = async (req, res) => {
  try {
    const { title, description, taskType, priority, assignedOperator, notes } = req.body;

    if (!title || !description || !assignedOperator) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and assigned operator are required",
      });
    }

    if (![ROLES.ADMIN, ROLES.SUPERVISOR].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only Admin and Supervisor can create tasks" });
    }

    const operator = await Operator.findById(assignedOperator);
    if (!operator) {
      return res.status(400).json({ success: false, message: "Assigned operator not found" });
    }

    if (operator.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: `Cannot assign task to inactive operator (${operator.name})`,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      taskType: taskType ? taskType.trim() : "PICKING",
      priority: priority || "MEDIUM",
      assignedOperator,
      notes: notes || "",
      status: "PENDING",
    });

    const populatedTask = await Task.findById(task._id).populate(
      "assignedOperator",
      "name employeeCode role shift status"
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET TASKS =================
const getTasks = async (req, res) => {
  try {
    const { status, priority, operatorId, search } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (priority && priority !== "ALL") {
      filter.priority = priority;
    }

    if (operatorId && operatorId !== "ALL") {
      filter.assignedOperator = operatorId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { taskType: { $regex: search, $options: "i" } },
      ];
    }

    // Role-specific scoping
    if (req.user.role === ROLES.OPERATOR) {
      // Find operator ID if not in token
      let opId = req.user.operatorId;
      if (!opId) {
        const op = await Operator.findOne({ employeeCode: req.user.username.toUpperCase() });
        if (op) opId = op._id;
      }
      filter.assignedOperator = opId;
    }

    const tasks = await Task.find(filter)
      .populate("assignedOperator", "name employeeCode role shift status")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE TASK =================
const updateTask = async (req, res) => {
  try {
    const {
      status,
      title,
      description,
      taskType,
      priority,
      assignedOperator,
      notes,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // ================= OPERATOR PERMISSIONS =================
    if (req.user.role === ROLES.OPERATOR) {
      let opId = req.user.operatorId?.toString();
      if (!opId) {
        const op = await Operator.findOne({ employeeCode: req.user.username.toUpperCase() });
        if (op) opId = op._id.toString();
      }

      if (!opId || task.assignedOperator.toString() !== opId) {
        return res.status(403).json({ success: false, message: "Access denied. You can only update your own tasks." });
      }

      if (title || description || taskType || priority || assignedOperator) {
        return res.status(403).json({
          success: false,
          message: "Operators are only permitted to update task status",
        });
      }
    }

    // ================= STATUS TRANSITIONS =================
    if (status && status !== task.status) {
      const allowedTransitions = {
        PENDING: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "PENDING", "CANCELLED"],
        COMPLETED: ["IN_PROGRESS"], // Reopen if needed
        CANCELLED: ["PENDING"],
      };

      // If operator, they can only move forward: PENDING -> IN_PROGRESS -> COMPLETED
      if (req.user.role === ROLES.OPERATOR) {
        const operatorFlow = {
          PENDING: ["IN_PROGRESS"],
          IN_PROGRESS: ["COMPLETED"],
          COMPLETED: [],
        };
        if (!operatorFlow[task.status]?.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition from ${task.status} to ${status} for operator`,
          });
        }
      } else {
        // Admin and supervisor have more flexibility
        if (!allowedTransitions[task.status]?.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid task status transition from ${task.status} to ${status}`,
          });
        }
      }

      task.status = status;
      if (status === "COMPLETED") {
        task.completedDate = new Date();
      } else if (task.completedDate) {
        task.completedDate = null;
      }
    }

    // ================= SUPERVISOR / ADMIN UPDATES =================
    if (req.user.role === ROLES.SUPERVISOR || req.user.role === ROLES.ADMIN) {
      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (taskType !== undefined) task.taskType = taskType.trim();
      if (priority !== undefined) task.priority = priority;
      if (notes !== undefined) task.notes = notes.trim();

      if (assignedOperator !== undefined && assignedOperator !== task.assignedOperator.toString()) {
        const newOp = await Operator.findById(assignedOperator);
        if (!newOp) {
          return res.status(400).json({ success: false, message: "Target operator does not exist" });
        }
        if (newOp.status !== "ACTIVE") {
          return res.status(400).json({ success: false, message: "Cannot assign task to inactive operator" });
        }
        task.assignedOperator = assignedOperator;
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id).populate(
      "assignedOperator",
      "name employeeCode role shift status"
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE TASK =================
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};