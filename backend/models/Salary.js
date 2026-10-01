const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    basicSalary: {
      type: Number,
      default: 0,
    },

    pfNumber: {
      type: String,
      default: "",
      trim: true,
    },

    pfApplicable: {
      type: Boolean,
      default: false,
    },

    esiNumber: {
      type: String,
      default: "",
      trim: true,
    },

    esiApplicable: {
      type: Boolean,
      default: false,
    },

    effectiveDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Salary",
  salarySchema
);