const ALLOWED_ROLES = ["PICKER", "PACKER", "SUPERVISOR", "FORKLIFT", "INVENTORY"];
const ALLOWED_STATUS = ["ACTIVE", "INACTIVE"];

const validateCreateOperator = (data) => {
  // Support standard payload (name, employeeCode, role, shift)
  const name = data.name || data.empname;
  const employeeCode = data.employeeCode || data.empid;
  const shift = data.shift || data.empdob;
  const role = data.role || "PICKER";

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Operator name is required";
  }

  if (!employeeCode || typeof employeeCode !== "string" || employeeCode.trim().length === 0) {
    return "Employee code is required";
  }

  if (!shift || typeof shift !== "string" || shift.trim().length === 0) {
    return "Shift schedule is required";
  }

  if (role && !ALLOWED_ROLES.includes(role.toUpperCase())) {
    return `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`;
  }

  return null;
};

const validateUpdateOperator = (data) => {
  if (data.role && !ALLOWED_ROLES.includes(data.role.toUpperCase())) {
    return `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(", ")}`;
  }

  if (data.status && !ALLOWED_STATUS.includes(data.status.toUpperCase())) {
    return `Invalid status. Allowed values: ${ALLOWED_STATUS.join(", ")}`;
  }

  return null;
};

module.exports = {
  validateCreateOperator,
  validateUpdateOperator,
  ALLOWED_ROLES,
  ALLOWED_STATUS,
};