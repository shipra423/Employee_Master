
const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    designationCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    designationName: {
      type: String,
      trim: true,
      required: true,
    },

    designationType: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Designation",
  designationSchema
);

