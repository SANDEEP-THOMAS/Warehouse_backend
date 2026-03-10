const Task = require("../models/taskModel");
const Operator = require("../models/operatorModel");
const User = require("../models/userModel");

const getDashboard = async (req, res) => {
  try {
    const { role, _id } = req.user; // ✅ FIXED HERE

    // ==============================
    // ADMIN DASHBOARD
    // ==============================
    if (role === "ADMIN") {

      const totalOperators = await Operator.countDocuments();

      const activeOperators = await Operator.countDocuments({
        status: "ACTIVE",
      });

      const totalTasks = await Task.countDocuments();

      const pendingTasks = await Task.countDocuments({
        status: "PENDING",
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = await Task.countDocuments({
        status: "COMPLETED",
        completedDate: { $gte: today },
      });

      const tasksByStatus = await Task.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      return res.status(200).json({
        role: "ADMIN",
        totalOperators,
        activeOperators,
        totalTasks,
        pendingTasks,
        completedToday,
        tasksByStatus,
      });
    }

    // ==============================
    // SUPERVISOR DASHBOARD
    // ==============================
    if (role === "SUPERVISOR") {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tasksAssignedToday = await Task.countDocuments({
        createdAt: { $gte: today },
      });

      const pendingTasks = await Task.countDocuments({
        status: "PENDING",
      });

      const operatorsOnShift = await Operator.countDocuments({
        status: "ACTIVE",
      });

      return res.status(200).json({
        role: "SUPERVISOR",
        tasksAssignedToday,
        pendingTasks,
        operatorsOnShift,
      });
    }

    // ==============================
    // OPERATOR DASHBOARD
    // ==============================
    if (role === "OPERATOR") {

      const user = await User.findById(_id); // ✅ FIXED HERE

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!user.operatorId) {
        return res.status(400).json({
          message: "Operator not linked to this user",
        });
      }

      const operatorExists = await Operator.findById(user.operatorId);

      if (!operatorExists) {
        return res.status(400).json({
          message: "Invalid operatorId linked to user",
        });
      }

      const myTasks = await Task.countDocuments({
        assignedOperator: user.operatorId,
      });

      const myPendingTasks = await Task.countDocuments({
        assignedOperator: user.operatorId,
        status: "PENDING",
      });

      const myCompletedTasks = await Task.countDocuments({
        assignedOperator: user.operatorId,
        status: "COMPLETED",
      });

      return res.status(200).json({
        role: "OPERATOR",
        myTasks,
        myPendingTasks,
        myCompletedTasks,
      });
    }

    return res.status(403).json({
      message: "Invalid role",
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = { getDashboard };