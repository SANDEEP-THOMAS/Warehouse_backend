const mongoose = require("mongoose");

const OPERATOR_ROLES = ["PICKER", "PACKER", "SUPERVISOR", "FORKLIFT", "INVENTORY"];
const OPERATOR_STATUS = ["ACTIVE", "INACTIVE"];

const operatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    role: {
      type: String,
      enum: OPERATOR_ROLES,
      default: "PICKER",
      required: true,
    },
    shift: {
      type: String,
      required: true,
      trim: true,
      default: "Morning (08:00 - 16:00)",
    },
    status: {
      type: String,
      enum: OPERATOR_STATUS,
      default: "ACTIVE",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operator", operatorSchema);