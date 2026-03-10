const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
  createUser,
  getUsers,
  updateUser,
  deactivateUser,
} = require("../controllers/userController");

router.post("/", protect, authorize("ADMIN"), createUser);
// router.post("/", createUser);
router.get("/", protect, authorize("ADMIN"), getUsers);
router.put("/:id", protect, authorize("ADMIN"), updateUser);
router.patch("/:id/deactivate", protect, authorize("ADMIN"), deactivateUser);

module.exports = router;