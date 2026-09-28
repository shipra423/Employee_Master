
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
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    basicSalary: {
      type: Number,
      default: 0,
    },

    pfNumber: {
      type: String,
      trim: true,
    },

    pfApplicable: {
      type: Boolean,
      default: false,
    },

    esiNumber: {
      type: String,
      trim: true,
    },

    esiApplicable: {
      type: Boolean,
      default: false,
    },

    effectiveDate: {
      type: Date,
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

