const {
  createOperator,
  updateOperator,
  toggleOperatorStatus,
  deleteOperator,
  searchOperators,
} = require("../services/operatorService");

const {
  validateCreateOperator,
  validateUpdateOperator,
} = require("../validators/operatorValidator");

// CREATE OPERATOR
const createOperatorController = async (req, res) => {
  try {
    const error = validateCreateOperator(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const operator = await createOperator(req.body);

    res.status(201).json({
      success: true,
      message: "Operator created successfully with login credentials",
      operator,
      defaultLogin: {
        username: operator.employeeCode.toLowerCase(),
        password: req.body.password || operator.employeeCode,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET / SEARCH OPERATORS
const getOperatorsController = async (req, res) => {
  try {
    const operators = await searchOperators(req.query);
    // Return array directly for frontend convenience, with full support
    return res.status(200).json(operators);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE OPERATOR
const updateOperatorController = async (req, res) => {
  try {
    const error = validateUpdateOperator(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const operator = await updateOperator(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Operator updated successfully",
      operator,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// TOGGLE / SOFT DELETE OPERATOR STATUS
const toggleOperatorStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const operator = await toggleOperatorStatus(req.params.id, status);

    res.status(200).json({
      success: true,
      message: `Operator status updated to ${operator.status}`,
      operator,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE OPERATOR
const deleteOperatorController = async (req, res) => {
  try {
    const result = await deleteOperator(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOperatorController,
  getOperatorsController,
  updateOperatorController,
  toggleOperatorStatusController,
  deleteOperatorController,
  // Alias for backward compatibility
  softDeleteOperatorController: toggleOperatorStatusController,
  searchOperatorController: getOperatorsController,
};
