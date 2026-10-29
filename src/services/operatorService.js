const Operator = require("../models/operatorModel");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const bcrypt = require("bcryptjs");
const ROLES = require("../constants/roles");

const createOperator = async (data) => {
  const name = (data.name || data.empname || "").trim();
  const employeeCode = (data.employeeCode || data.empid || "").trim().toUpperCase();
  const shift = (data.shift || data.empdob || "").trim();
  const role = (data.role || "PICKER").toUpperCase();
  const status = (data.status || "ACTIVE").toUpperCase();
  const contactPhone = (data.contactPhone || "").trim();

  // 1️⃣ Check duplicate employeeCode
  const existing = await Operator.findOne({ employeeCode });
  if (existing) {
    throw new Error(`Operator with Employee Code "${employeeCode}" already exists`);
  }

  // 2️⃣ Create operator record
  const operator = await Operator.create({
    name,
    employeeCode,
    role,
    shift,
    status,
    contactPhone,
  });

  // 3️⃣ Automatically generate User login account for the operator
  const username = employeeCode.toLowerCase();
  const rawPassword = data.password && data.password.trim() ? data.password.trim() : employeeCode;
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Check if a user with this username already exists
  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    await User.create({
      name,
      username,
      password: hashedPassword,
      role: ROLES.OPERATOR,
      operatorId: operator._id,
      isActive: status === "ACTIVE",
    });
  } else {
    // Link existing user if found
    existingUser.operatorId = operator._id;
    existingUser.isActive = status === "ACTIVE";
    await existingUser.save();
  }

  return operator;
};

const updateOperator = async (id, data) => {
  const operator = await Operator.findById(id);
  if (!operator) {
    throw new Error("Operator not found");
  }

  if (data.employeeCode && data.employeeCode.toUpperCase() !== operator.employeeCode) {
    const code = data.employeeCode.toUpperCase();
    const existing = await Operator.findOne({ employeeCode: code });
    if (existing && existing._id.toString() !== id) {
      throw new Error(`Employee Code "${code}" already in use by another operator`);
    }
    operator.employeeCode = code;
  }

  if (data.name) operator.name = data.name.trim();
  if (data.role) operator.role = data.role.toUpperCase();
  if (data.shift) operator.shift = data.shift.trim();
  if (data.contactPhone !== undefined) operator.contactPhone = data.contactPhone.trim();

  if (data.status) {
    operator.status = data.status.toUpperCase();
    // Synchronize linked user status
    await User.updateMany({ operatorId: operator._id }, { isActive: operator.status === "ACTIVE" });
  }

  await operator.save();

  // Also update user's display name if changed
  if (data.name) {
    await User.updateMany({ operatorId: operator._id }, { name: operator.name });
  }

  return operator;
};

const toggleOperatorStatus = async (id, status) => {
  const operator = await Operator.findById(id);
  if (!operator) {
    throw new Error("Operator not found");
  }

  const newStatus = status ? status.toUpperCase() : (operator.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  operator.status = newStatus;
  await operator.save();

  // Sync user account active status
  await User.updateMany({ operatorId: operator._id }, { isActive: newStatus === "ACTIVE" });

  return operator;
};

const deleteOperator = async (id) => {
  const operator = await Operator.findById(id);
  if (!operator) {
    throw new Error("Operator not found");
  }

  // Check if operator has active/pending tasks
  const activeTasks = await Task.countDocuments({
    assignedOperator: id,
    status: { $in: ["PENDING", "IN_PROGRESS"] },
  });

  if (activeTasks > 0) {
    throw new Error(`Cannot delete operator with ${activeTasks} pending or in-progress tasks. Reassign or complete tasks first.`);
  }

  // Remove linked user account
  await User.deleteMany({ operatorId: id });

  // Delete operator
  await Operator.findByIdAndDelete(id);

  return { message: "Operator and linked credentials deleted successfully" };
};

const searchOperators = async (query = {}) => {
  const filter = {};

  if (query.name) {
    filter.name = { $regex: query.name, $options: "i" };
  }

  if (query.employeeCode) {
    filter.employeeCode = { $regex: query.employeeCode, $options: "i" };
  }

  if (query.role && query.role !== "ALL") {
    filter.role = query.role.toUpperCase();
  }

  if (query.status && query.status !== "ALL") {
    filter.status = query.status.toUpperCase();
  }

  if (query.shift) {
    filter.shift = { $regex: query.shift, $options: "i" };
  }

  const operators = await Operator.find(filter).sort({ createdAt: -1 });
  return operators;
};

module.exports = {
  createOperator,
  updateOperator,
  toggleOperatorStatus,
  deleteOperator,
  searchOperators,
};