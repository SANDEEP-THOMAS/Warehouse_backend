const Operator = require("../models/operatorModel");

const {
  createOperator,
  updateOperator,
  softDeleteOperator,
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
      return res.status(400).json({ message: error });
    }

    const operator = await createOperator(req.body);

    res.status(201).json({
      message: "Operator created successfully",
      operator,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE OPERATOR
const updateOperatorController = async (req, res) => {
  try {
    const error = validateUpdateOperator(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const operator = await updateOperator(req.params.id, req.body);

    res.status(200).json({
      message: "Operator updated successfully",
      operator,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// SOFT DELETE OPERATOR
const softDeleteOperatorController = async (req, res) => {
  try {
    const operator = await softDeleteOperator(req.params.id);

    res.status(200).json({
      message: "Operator deactivated successfully",
      operator,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// SEARCH OPERATORS
const searchOperatorController = async (req, res) => {
  try {
    const operators = await searchOperators(req.query);

    // 🔥 Return array directly (frontend expects this)
    return res.status(200).json(operators);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// delete operator

const deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operators = await Operator.findByIdAndDelete(id);

    if (!operators) {
      return res.status(404).json({ message: "Operator not found" });
    }

    res.status(200).json({ message: "Operator deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update operator
const editOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operators = await Operator.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!operators) {
      return res.status(404).json({ message: "operator not found" });
    }

    res.status(200).json({ message: "Operator updated successfully" });
  } catch (error) {}
};

module.exports = {
  createOperatorController,
  updateOperatorController,
  softDeleteOperatorController,
  searchOperatorController,
  deleteOperator,
  editOperator,
};
