const express = require("express");
const router = express.Router();

const {
  createOperatorController,
  getOperatorsController,
  updateOperatorController,
  toggleOperatorStatusController,
  deleteOperatorController,
} = require("../controllers/operatorController");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

// All operator routes require authentication
router.use(protect);

// GET /api/operators - List & filter (Admin, Supervisor, Operator)
router.get("/", authorize("ADMIN", "SUPERVISOR", "OPERATOR"), getOperatorsController);

// POST /api/operators - Create operator (Admin & Supervisor)
router.post("/", authorize("ADMIN", "SUPERVISOR"), createOperatorController);

// PUT /api/operators/:id - Update operator (Admin & Supervisor)
router.put("/:id", authorize("ADMIN", "SUPERVISOR"), updateOperatorController);

// PATCH /api/operators/:id/status - Toggle/set status (Admin & Supervisor)
router.patch("/:id/status", authorize("ADMIN", "SUPERVISOR"), toggleOperatorStatusController);

// Legacy PATCH /api/operators/:id/deactivate
router.patch("/:id/deactivate", authorize("ADMIN", "SUPERVISOR"), toggleOperatorStatusController);

// DELETE /api/operators/:id - Delete operator (Admin only)
router.delete("/:id", authorize("ADMIN"), deleteOperatorController);

module.exports = router;