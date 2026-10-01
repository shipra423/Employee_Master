const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    unitCode: {
      type: String,
      default: "",
      trim: true,
    },

    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      default: "",
      trim: true,
    },

    dob: {
      type: Date,
      default: null,
    },

    aadhar: {
      type: String,
      default: "",
      trim: true,
    },

    contactNo: {
      type: String,
      default: "",
      trim: true,
    },

    mailId: {
      type: String,
      default: "",
      trim: true,
    },

    departmentCode: {
      type: String,
      required: true,
      trim: true,
    },

    contractorCode: {
      type: String,
      default: "",
      trim: true,
    },

    assignedShift: {
      type: String,
      default: "",
      trim: true,
    },

    designation: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    reportingPerson: {
      type: String,
      default: "",
      trim: true,
    },

    joiningDate: {
      type: Date,
      default: null,
    },

    resignDate: {
      type: Date,
      default: null,
    },

    creationDate: {
      type: Date,
      default: Date.now,
    },

    // =====================================================
    // EMPLOYEE PHOTO
    // =====================================================

    photo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Employee",
  employeeSchema
);