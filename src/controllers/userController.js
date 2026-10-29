const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Operator = require("../models/operatorModel");
const ROLES = require("../constants/roles");

// ================= CREATE USER =================
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, operatorId } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, username, password, and role are required" });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ success: false, message: `Username "${cleanUsername}" is already taken` });
    }

    // OPERATOR role validation
    let linkedOperator = null;
    if (role === ROLES.OPERATOR) {
      if (!operatorId) {
        return res.status(400).json({
          success: false,
          message: "Operator accounts must be linked to an Operator record",
        });
      }

      linkedOperator = await Operator.findById(operatorId);
      if (!linkedOperator) {
        return res.status(400).json({ success: false, message: "Specified operator does not exist" });
      }

      if (linkedOperator.status !== "ACTIVE") {
        return res.status(400).json({
          success: false,
          message: "Cannot create login for an inactive operator",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      password: hashedPassword,
      role,
      operatorId: role === ROLES.OPERATOR ? operatorId : null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "User account created successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        operatorId: user.operatorId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET USERS =================
const getUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role && role !== "ALL") {
      filter.role = role;
    }

    if (status === "ACTIVE") filter.isActive = true;
    if (status === "INACTIVE") filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("operatorId", "name employeeCode role shift status")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { name, username, role, isActive, operatorId, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      const existing = await User.findOne({ username: cleanUsername });
      if (existing && existing._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: `Username "${cleanUsername}" is already taken` });
      }
      user.username = cleanUsername;
    }

    if (password && password.trim().length > 0) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }

    if (role) {
      if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      user.role = role;
    }

    if (user.role === ROLES.OPERATOR) {
      const targetOperatorId = operatorId || user.operatorId;
      if (!targetOperatorId) {
        return res.status(400).json({
          success: false,
          message: "Operator user must have a linked operator record",
        });
      }
      const op = await Operator.findById(targetOperatorId);
      if (!op) {
        return res.status(400).json({ success: false, message: "Operator not found" });
      }
      user.operatorId = targetOperatorId;
    } else {
      user.operatorId = null;
    }

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("operatorId", "name employeeCode role shift status");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= TOGGLE / DEACTIVATE USER =================
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.username === process.env.INITIAL_ADMIN_USERNAME && user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate system administrator account",
      });
    }

    user.isActive = typeof req.body.isActive === "boolean" ? req.body.isActive : !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User is now ${user.isActive ? "active" : "inactive"}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.username === process.env.INITIAL_ADMIN_USERNAME) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the root system administrator",
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own logged-in user account",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  toggleUserStatus,
  deactivateUser: toggleUserStatus,
  deleteUser,
};