const mongoose = require("mongoose");

const contractorSchema = new mongoose.Schema(
  {
    contractorCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    contractorName: {
      type: String,
      trim: true,
      required: true,
    },

    contractorType: {
      type: String,
      trim: true,
      required: true,
    },

    contactNo: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
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
  "Contractor",
  contractorSchema
);