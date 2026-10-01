const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =================================================
    // AUTO USER ID
    // 1, 2, 3, 4...
    // =================================================
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =================================================
    // UNIT
    // =================================================
    unit: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // EMPLOYEE ID
    // Employee Master -> employeeCode
    // =================================================
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // =================================================
    // EMPLOYEE NAME
    // =================================================
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    // =================================================
    // PASSWORD
    // Stored as bcrypt hash
    // =================================================
    password: {
      type: String,
      required: true,
    },

    // =================================================
    // VALIDITY
    // =================================================
    validFrom: {
      type: String,
      required: true,
    },

    validTo: {
      type: String,
      required: true,
    },

    valid: {
      type: String,
      enum: ["YES", "NO"],
      default: "YES",
    },

    // =================================================
    // PASSWORD SETTINGS
    // =================================================
    msgBeforeDays: {
      type: Number,
      default: 0,
    },

    pwdChangeDays: {
      type: Number,
      default: 0,
    },

    passwordLevel: {
      type: String,
      default: "USER",
      trim: true,
    },

    // =================================================
    // ROLES
    // =================================================
    roles: [
      {
        userRole: {
          type: String,
          default: "",
          trim: true,
        },

        roleName: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    // =================================================
    // AUTHORIZED UNITS
    // =================================================
    authorizedUnits: [
      {
        unitCode: {
          type: String,
          default: "",
          trim: true,
        },

        unitName: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);