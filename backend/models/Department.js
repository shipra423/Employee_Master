const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    departmentName: {
      type: String,
      trim: true,
      required: true,
    },

    departmentType: {
      type: String,
      trim: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Department",
  departmentSchema
);