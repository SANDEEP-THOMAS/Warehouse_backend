const Task = require("../models/taskModel");
const Operator = require("../models/operatorModel");
const User = require("../models/userModel");

const getDashboard = async (req, res) => {
  try {
    const { role, _id, username } = req.user;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ==========================================
    // 1️⃣ ADMIN DASHBOARD
    // ==========================================
    if (role === "ADMIN") {
      const [
        totalOperators,
        activeOperators,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedToday,
        urgentTasks,
        totalUsers,
        recentTasks,
      ] = await Promise.all([
        Operator.countDocuments(),
        Operator.countDocuments({ status: "ACTIVE" }),
        Task.countDocuments(),
        Task.countDocuments({ status: "PENDING" }),
        Task.countDocuments({ status: "IN_PROGRESS" }),
        Task.countDocuments({ status: "COMPLETED", completedDate: { $gte: today } }),
        Task.countDocuments({ priority: { $in: ["HIGH", "URGENT"] }, status: { $ne: "COMPLETED" } }),
        User.countDocuments(),
        Task.find()
          .populate("assignedOperator", "name employeeCode role")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const tasksByStatus = await Task.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const operatorsByRole = await Operator.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]);

      return res.status(200).json({
        role: "ADMIN",
        totalOperators,
        activeOperators,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedToday,
        urgentTasks,
        totalUsers,
        tasksByStatus,
        operatorsByRole,
        recentTasks,
      });
    }

    // ==========================================
    // 2️⃣ SUPERVISOR DASHBOARD
    // ==========================================
    if (role === "SUPERVISOR") {
      const [
        tasksAssignedToday,
        pendingTasks,
        inProgressTasks,
        completedToday,
        operatorsOnShift,
        urgentTasks,
        recentTasks,
      ] = await Promise.all([
        Task.countDocuments({ createdAt: { $gte: today } }),
        Task.countDocuments({ status: "PENDING" }),
        Task.countDocuments({ status: "IN_PROGRESS" }),
        Task.countDocuments({ status: "COMPLETED", completedDate: { $gte: today } }),
        Operator.countDocuments({ status: "ACTIVE" }),
        Task.countDocuments({ priority: { $in: ["HIGH", "URGENT"] }, status: { $ne: "COMPLETED" } }),
        Task.find()
          .populate("assignedOperator", "name employeeCode role")
          .sort({ createdAt: -1 })
          .limit(6),
      ]);

      return res.status(200).json({
        role: "SUPERVISOR",
        tasksAssignedToday,
        pendingTasks,
        inProgressTasks,
        completedToday,
        operatorsOnShift,
        urgentTasks,
        recentTasks,
      });
    }

    // ==========================================
    // 3️⃣ OPERATOR DASHBOARD
    // ==========================================
    if (role === "OPERATOR") {
      const user = await User.findById(_id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let opId = user.operatorId;
      if (!opId) {
        const op = await Operator.findOne({ employeeCode: username.toUpperCase() });
        if (op) {
          opId = op._id;
          user.operatorId = op._id;
          await user.save();
        }
      }

      let operatorInfo = null;
      let myTasks = 0;
      let myPendingTasks = 0;
      let myInProgressTasks = 0;
      let myCompletedTasks = 0;
      let myRecentTasks = [];

      if (opId) {
        operatorInfo = await Operator.findById(opId);
        [
          myTasks,
          myPendingTasks,
          myInProgressTasks,
          myCompletedTasks,
          myRecentTasks,
        ] = await Promise.all([
          Task.countDocuments({ assignedOperator: opId }),
          Task.countDocuments({ assignedOperator: opId, status: "PENDING" }),
          Task.countDocuments({ assignedOperator: opId, status: "IN_PROGRESS" }),
          Task.countDocuments({ assignedOperator: opId, status: "COMPLETED" }),
          Task.find({ assignedOperator: opId })
            .sort({ createdAt: -1 })
            .limit(10),
        ]);
      }

      return res.status(200).json({
        role: "OPERATOR",
        operator: operatorInfo,
        myTasks,
        myPendingTasks,
        myInProgressTasks,
        myCompletedTasks,
        recentTasks: myRecentTasks,
      });
    }

    return res.status(403).json({ success: false, message: "Invalid role" });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = { getDashboard };