const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Operator = require("../models/operatorModel");
const ROLES = require("../constants/roles");


// ================= CREATE USER =================
const createUser = async (req, res) => {
  try {
    const { name, username, password, role, operatorId } = req.body;

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check username uniqueness
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // OPERATOR role validation
    if (role === ROLES.OPERATOR) {
      if (!operatorId) {
        return res.status(400).json({
          message: "Operator users must have linked operatorId",
        });
      }

      const operator = await Operator.findById(operatorId);

      if (!operator) {
        return res.status(400).json({ message: "Invalid operatorId" });
      }

      if (operator.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Cannot link inactive operator",
        });
      }
    }

    // Non-operator must not have operatorId
    if (role !== ROLES.OPERATOR && operatorId) {
      return res.status(400).json({
        message: "Only OPERATOR role can have operatorId",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      role,
      operatorId: role === ROLES.OPERATOR ? operatorId : null,
    });

    res.status(201).json({
      message: "User created successfully",
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
    res.status(500).json({ message: error.message });
  }
};



// ================= GET USERS =================
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("operatorId", "name employeeCode status");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { name, username, role, isActive, operatorId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ================= BASIC FIELD UPDATES =================
    if (name) user.name = name;
    if (username) user.username = username;

    if (role) {
      if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    // ================= OPERATOR VALIDATION (FIXED) =================
    // Only validate operator linking if role or operatorId is being updated
    if (role !== undefined || operatorId !== undefined) {

      const finalRole = role || user.role;

      if (finalRole === ROLES.OPERATOR) {

        const finalOperatorId = operatorId || user.operatorId;

        if (!finalOperatorId) {
          return res.status(400).json({
            message: "Operator users must have linked operatorId",
          });
        }

        const operator = await Operator.findById(finalOperatorId);

        if (!operator) {
          return res.status(400).json({ message: "Invalid operatorId" });
        }

        if (operator.status !== "ACTIVE") {
          return res.status(400).json({
            message: "Cannot link inactive operator",
          });
        }

        user.operatorId = finalOperatorId;

      } else {
        user.operatorId = null;
      }
    }

    // ================= ISACTIVE UPDATE =================
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
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
    res.status(500).json({ message: error.message });
  }
};



// ================= DEACTIVATE USER =================
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      message: "User deactivated successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createUser,
  getUsers,
  updateUser,
  deactivateUser,
};