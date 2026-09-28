const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    attendanceDate: {
      type: Date,
      default: Date.now,
    },

    employeeCode: {
      type: String,
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

    shift: {
      type: String,
      trim: true,
    },

    inTime: {
      type: String,
      trim: true,
    },

    outTime: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["P", "A"],
      default: "A",
    },

    // Excel ke saare extra columns yahan save honge
    excelData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);