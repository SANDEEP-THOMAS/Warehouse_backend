const mongoose = require("mongoose");

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
    },
    // role: {
    //   type: String,
    //   enum: ["PICKER", "PACKER", "SUPERVISOR"],
    //   // required: true,
    // },
    shift: {
      type: String,
      // required: true,
      trim: true,
    },
    // status: {
    //   type: String,
    //   enum: ["ACTIVE", "INACTIVE"],
    //   default: "ACTIVE",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operator", operatorSchema);