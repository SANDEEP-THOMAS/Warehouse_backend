const express = require("express");
const router = express.Router();

const {
  createOperatorController,
  updateOperatorController,
  softDeleteOperatorController,
  searchOperatorController,
  deleteOperator,
  editOperator,
} = require("../controllers/operatorController");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");


// CREATE OPERATOR (Admin & Supervisor allowed)
router.post(
  "/",
  protect,
  authorize("ADMIN", "SUPERVISOR"),
  createOperatorController
);

// UPDATE OPERATOR
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "SUPERVISOR"),
  updateOperatorController
);

// SOFT DELETE OPERATOR
router.patch(
  "/:id/deactivate",
  protect,
  authorize("ADMIN"),
  softDeleteOperatorController
);

// SEARCH OPERATORS
router.get(
  "/",
  protect,
  authorize("ADMIN", "SUPERVISOR"),
  searchOperatorController
);


// delete operator
router.delete("/:id",deleteOperator)
router.patch('/:id',editOperator)

module.exports = router;