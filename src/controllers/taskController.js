// const Task = require("../models/taskModel");
// const Operator = require("../models/operatorModel");
// const ROLES = require("../constants/roles");

// ================= CREATE TASK =================
// const createTask = async (req, res) => {
//   try {
//     const { title, description, taskType, priority, assignedOperator } = req.body;

//     // Only Admin or Supervisor can create
//     if (![ROLES.ADMIN, ROLES.SUPERVISOR].includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const operator = await Operator.findById(assignedOperator);

//     if (!operator) {
//       return res.status(400).json({ message: "Invalid operator" });
//     }

//     if (operator.status !== "ACTIVE") {
//       return res.status(400).json({
//         message: "Cannot assign task to inactive operator",
//       });
//     }

//     const task = await Task.create({
//       title,
//       description,
//       taskType,
//       priority,
//       assignedOperator,
//     });

//     return res.status(201).json({
//       message: "Task created successfully",
//       task,
//     });

//   } catch (error) {
//     console.log("CREATE TASK ERROR:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// ================= GET TASKS =================
// const getTasks = async (req, res) => {
//   try {
//     let tasks = [];

//     if (req.user.role === "OPERATOR") {
//       tasks = await Task.find({
//         assignedOperator: req.user.operatorId,
//       }).populate("assignedOperator", "name employeeCode");
//     } else {
//       tasks = await Task.find().populate(
//         "assignedOperator",
//         "name employeeCode"
//       );
//     }

//     return res.status(200).json(tasks);

//   } catch (error) {
//     console.log("GET TASK ERROR:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// ================= UPDATE TASK =================
// const updateTask = async (req, res) => {
//   try {
//     const { status, title, description, priority } = req.body;

//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     // OPERATOR: only update own task
//     if (req.user.role === ROLES.OPERATOR) {
//       if (
//         !req.user.operatorId ||
//         task.assignedOperator.toString() !== req.user.operatorId.toString()
//       ) {
//         return res.status(403).json({ message: "Access denied" });
//       }
//     }

//     // STATUS FLOW VALIDATION
//     if (status) {
//       const validFlow = {
//         PENDING: ["IN_PROGRESS"],
//         IN_PROGRESS: ["COMPLETED"],
//         COMPLETED: [],
//       };

//       if (!validFlow[task.status]?.includes(status)) {
//         return res.status(400).json({
//           message: "Invalid task status transition",
//         });
//       }

//       task.status = status;

//       if (status === "COMPLETED") {
//         task.completedDate = new Date();
//       }
//     }

//     // ADMIN: can update everything
//     if (req.user.role === ROLES.ADMIN) {
//       if (title) task.title = title;
//       if (description) task.description = description;
//       if (priority) task.priority = priority;
//     }

// //     if (req.user.role === ROLES.ADMIN) {
// //   if (title) task.title = title;
// //   if (description) task.description = description;
// //   if (priority) task.priority = priority;

// //   if (req.body.assignedOperator) {
// //     const operator = await Operator.findById(req.body.assignedOperator);

// //     if (!operator) {
// //       return res.status(400).json({ message: "Invalid operator" });
// //     }

// //     if (operator.status !== "ACTIVE") {
// //       return res.status(400).json({
// //         message: "Cannot assign task to inactive operator",
// //       });
// //     }

// //     task.assignedOperator = req.body.assignedOperator;
// //   }
// // }

//     // SUPERVISOR: can only update status
//     if (req.user.role === ROLES.SUPERVISOR) {
//       if (title || description || priority) {
//         return res.status(403).json({
//           message: "Supervisor can only update status",
//         });
//       }
//     }

//     await task.save();

//     return res.status(200).json({
//       message: "Task updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.log("UPDATE TASK ERROR:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// ================= UPDATE TASK =================
// const updateTask = async (req, res) => {
//   try {
//     const { status, title, description, priority, assignedOperator } = req.body;

//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     // ================= OPERATOR =================
//     if (req.user.role === ROLES.OPERATOR) {
//       if (
//         !req.user.operatorId ||
//         task.assignedOperator.toString() !== req.user.operatorId.toString()
//       ) {
//         return res.status(403).json({ message: "Access denied" });
//       }

//       // Operator can ONLY update status
//       if (!status || title || description || priority || assignedOperator) {
//         return res.status(403).json({
//           message: "Operator can only update status",
//         });
//       }
//     }

//     // ================= SUPERVISOR =================
//     if (req.user.role === ROLES.SUPERVISOR) {
//       // Supervisor can ONLY update status
//       if (title || description || priority || assignedOperator) {
//         return res.status(403).json({
//           message: "Supervisor can only update status",
//         });
//       }
//     }

//     // ================= STATUS FLOW =================
//     if (status) {
//       const validFlow = {
//         PENDING: ["IN_PROGRESS"],
//         IN_PROGRESS: ["COMPLETED"],
//         COMPLETED: [],
//       };

//       if (!validFlow[task.status]?.includes(status)) {
//         return res.status(400).json({
//           message: "Invalid task status transition",
//         });
//       }

//       task.status = status;

//       if (status === "COMPLETED") {
//         task.completedDate = new Date();
//       }
//     }

//     // ================= ADMIN FULL CONTROL =================
//     // if (req.user.role === ROLES.ADMIN) {
//     //   if (title) task.title = title;
//     //   if (description) task.description = description;
//     //   if (priority) task.priority = priority;

//     //   if (assignedOperator) {
//     //     const operator = await Operator.findById(assignedOperator);

//     //     if (!operator) {
//     //       return res.status(400).json({ message: "Invalid operator" });
//     //     }

//     //     if (operator.status !== "ACTIVE") {
//     //       return res.status(400).json({
//     //         message: "Cannot assign task to inactive operator",
//     //       });
//     //     }

//     //     task.assignedOperator = assignedOperator;
//     //   }
//     // }

//     if (req.user.role === ROLES.ADMIN) {
//   if (title !== undefined) task.title = title;
//   if (description !== undefined) task.description = description;
//   if (priority !== undefined) task.priority = priority;

//   if (assignedOperator !== undefined) {
//     const operator = await Operator.findById(assignedOperator);

//     if (!operator) {
//       return res.status(400).json({ message: "Invalid operator" });
//     }

//     if (operator.status !== "ACTIVE") {
//       return res.status(400).json({
//         message: "Cannot assign task to inactive operator",
//       });
//     }

//     task.assignedOperator = assignedOperator;
//   }
// }

//     await task.save();

//     return res.status(200).json({
//       message: "Task updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.log("UPDATE TASK ERROR:", error);
//     return res.status(500).json({ message: error.message });
//   }
// };

// module.exports = {

//   createTask,
//   getTasks,
//   updateTask,
// };


const Task = require("../models/taskModel");
const Operator = require("../models/operatorModel");
const ROLES = require("../constants/roles");

// ================= CREATE TASK =================
const createTask = async (req, res) => {
  try {
    const { title, description, taskType, priority, assignedOperator } = req.body;

    if (![ROLES.ADMIN, ROLES.SUPERVISOR].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const operator = await Operator.findById(assignedOperator);

    if (!operator) {
      return res.status(400).json({ message: "Invalid operator" });
    }

    if (operator.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Cannot assign task to inactive operator",
      });
    }

    const task = await Task.create({
      title,
      description,
      taskType,
      priority,
      assignedOperator,
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.log("CREATE TASK ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET TASKS =================
const getTasks = async (req, res) => {
  try {
    let tasks = [];

    if (req.user.role === ROLES.OPERATOR) {
      tasks = await Task.find({
        assignedOperator: req.user.operatorId,
      }).populate("assignedOperator", "name employeeCode");
    } else {
      tasks = await Task.find().populate(
        "assignedOperator",
        "name employeeCode"
      );
    }

    return res.status(200).json(tasks);
  } catch (error) {
    console.log("GET TASK ERROR:", error);
    return res.status(500).json({ message: error.message });
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
    } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ================= OPERATOR =================
    if (req.user.role === ROLES.OPERATOR) {
      if (
        !req.user.operatorId ||
        task.assignedOperator.toString() !== req.user.operatorId.toString()
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!status || title || description || taskType || priority || assignedOperator) {
        return res.status(403).json({
          message: "Operator can only update status",
        });
      }
    }

    // ================= SUPERVISOR =================
    if (req.user.role === ROLES.SUPERVISOR) {
      if (title || description || taskType || priority || assignedOperator) {
        return res.status(403).json({
          message: "Supervisor can only update status",
        });
      }
    }

    // ================= STATUS FLOW =================
    if (status) {
      const validFlow = {
        PENDING: ["IN_PROGRESS"],
        IN_PROGRESS: ["COMPLETED"],
        COMPLETED: [],
      };

      if (!validFlow[task.status]?.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status transition",
        });
      }

      task.status = status;

      if (status === "COMPLETED") {
        task.completedDate = new Date();
      }
    }

    // ================= ADMIN FULL CONTROL =================
    if (req.user.role === ROLES.ADMIN) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (taskType !== undefined) task.taskType = taskType;
      if (priority !== undefined) task.priority = priority;

      if (assignedOperator !== undefined) {
        const operator = await Operator.findById(assignedOperator);

        if (!operator) {
          return res.status(400).json({ message: "Invalid operator" });
        }

        if (operator.status !== "ACTIVE") {
          return res.status(400).json({
            message: "Cannot assign task to inactive operator",
          });
        }

        task.assignedOperator = assignedOperator;
      }
    }

    await task.save();

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.log("UPDATE TASK ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
};