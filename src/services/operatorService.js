const Operator = require("../models/operatorModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// const createOperator = async (data) => {

//   const { name, employeeCode, role, shift } = data;

//   // check duplicate employeeCode
//   const existing = await Operator.findOne({ employeeCode });

//   if (existing) {
//     throw new Error("Employee Code already exists");
//   }

//   // 1️⃣ create operator
//   const operator = await Operator.create({
//     name,
//     employeeCode,
//     role,
//     shift,
//     status: "ACTIVE"
//   });

//   // 2️⃣ generate login automatically
//   const username = employeeCode.toLowerCase();
//   const password = employeeCode; // default password

//   const hashedPassword = await bcrypt.hash(password, 10);

//   // 3️⃣ create user login
//   await User.create({
//     name,
//     username,
//     password: hashedPassword,
//     role: "OPERATOR",
//     operatorId: operator._id,
//     isActive: true
//   });

//   return operator;
// };

const createOperator = async(data)=>{
  const name = data.empname;
  const employeeCode = data.empid
  const shift = data.empdob

  const operator = await Operator.create({
    name,
    employeeCode,
    shift
  });
  return operator
};





const updateOperator = async (id, data) => {

  const operator = await Operator.findById(id);

  if (!operator) {
    throw new Error("Operator not found");
  }

  if (data.employeeCode && data.employeeCode !== operator.employeeCode) {

    const existing = await Operator.findOne({
      employeeCode: data.employeeCode
    });

    if (existing) {
      throw new Error("Employee Code already exists");
    }
  }

  Object.assign(operator, data);

  await operator.save();

  return operator;
};

const softDeleteOperator = async (id) => {

  const operator = await Operator.findById(id);

  if (!operator) {
    throw new Error("Operator not found");
  }

  operator.status = "INACTIVE";

  await operator.save();

  return operator;
};

const searchOperators = async (query) => {

  const searchQuery = {};

  if (query.name) {
    searchQuery.name = { $regex: query.name, $options: "i" };
  }

  if (query.employeeCode) {
    searchQuery.employeeCode = { $regex: query.employeeCode, $options: "i" };
  }

  if (query.role) {
    searchQuery.role = query.role;
  }

  if (query.status) {
    searchQuery.status = query.status;
  }

  const operators = await Operator.find(searchQuery);

  return operators;
};

module.exports = {
  createOperator,
  updateOperator,
  softDeleteOperator,
  searchOperators,
};