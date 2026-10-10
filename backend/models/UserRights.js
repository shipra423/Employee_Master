const mongoose = require("mongoose");

// =====================================================
// USER RIGHT ROW SCHEMA
// =====================================================

const userRightRowSchema = new mongoose.Schema(
  {
    shortName: { type: String, default: "", trim: true },

    add: { type: Boolean, default: false },
    mod: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    del: { type: Boolean, default: false },

    fromDate: { type: String, default: "" },
    toDate: { type: String, default: "" },
  },
  { _id: false }
);

// =====================================================
// USER RIGHTS SCHEMA
// =====================================================

const userRightsSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    // employee / attendance / salary / security / sev-rights
    menuOption: {
      type: String,
      required: true,
      trim: true,
    },

    // Display name
    menuLabel: {
      type: String,
      default: "",
      trim: true,
    },

    rights: {
      type: [userRightRowSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Same user + same menu sirf ek baar
userRightsSchema.index(
  { employeeId: 1, menuOption: 1 },
  { unique: true }
);

module.exports = mongoose.model("UserRights", userRightsSchema);