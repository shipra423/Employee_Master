const mongoose = require("mongoose");

const bankDetailSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bankAcNo: {
      type: String,
      default: "",
    },

    ifscCode: {
      type: String,
      default: "",
    },

    pfNumber: {
      type: String,
      default: "",
    },

    pfMembershipDate: {
      type: Date,
      default: null,
    },

    esiNumber: {
      type: String,
      default: "",
    },

    esiMembershipDate: {
      type: Date,
      default: null,
    },

    panNo: {
      type: String,
      default: "",
    },

    pfApplicable: {
      type: Boolean,
      default: false,
    },

    esiApplicable: {
      type: Boolean,
      default: false,
    },

    bonusApplicable: {
      type: Boolean,
      default: false,
    },

    fpf: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BankDetail",
  bankDetailSchema
);