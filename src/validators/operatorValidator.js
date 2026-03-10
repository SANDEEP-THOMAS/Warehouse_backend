const validateCreateOperator = (data) => {
  // const { name, employeeCode, role, shift } = data;

  const name = data.empname;
  const employeeCode = data.empid
  const shift = data.empdob

  // if (!name || !employeeCode || !role || !shift) {
  //   return "All fields are required";
  // }

   if (!name || !employeeCode  || !shift) {
    return "All fields are required";
  }

  // const allowedRoles = ["PICKER", "PACKER", "SUPERVISOR"];
  // if (!allowedRoles.includes(role)) {
  //   return "Invalid role value";
  // }

  return null;
};

const validateUpdateOperator = (data) => {
  const allowedRoles = ["PICKER", "PACKER", "SUPERVISOR"];
  const allowedStatus = ["ACTIVE", "INACTIVE"];

  if (data.role && !allowedRoles.includes(data.role)) {
    return "Invalid role value";
  }

  if (data.status && !allowedStatus.includes(data.status)) {
    return "Invalid status value";
  }

  return null;
};

module.exports = {
  validateCreateOperator,
  validateUpdateOperator,
};