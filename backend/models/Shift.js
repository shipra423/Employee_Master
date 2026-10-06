const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    shiftCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    shiftName: {
      type: String,
      trim: true,
      required: true,
    },

    startTime: {
      type: String,
      trim: true,
      required: true,
    },

    endTime: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shift", shiftSchema);
