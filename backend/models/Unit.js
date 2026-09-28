const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    unitName: {
      type: String,
      trim: true,
      required: true,
    },

    unitType: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent OverwriteModelError
module.exports =
  mongoose.models.Unit || mongoose.model("Unit", unitSchema);