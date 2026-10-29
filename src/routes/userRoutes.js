const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
  createUser,
  getUsers,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userController");

router.use(protect);
router.use(authorize("ADMIN"));

// Admin only routes
router.post("/", createUser);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.patch("/:id/deactivate", toggleUserStatus);
router.patch("/:id/status", toggleUserStatus);
router.delete("/:id", deleteUser);

module.exports = router;