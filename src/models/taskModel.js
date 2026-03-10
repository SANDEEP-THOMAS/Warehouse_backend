const mongoose = require("mongoose");

const TASK_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};

const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    taskType: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },

    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },

    completedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Export only model
module.exports = mongoose.model("Task", taskSchema);