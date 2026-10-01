const mongoose = require("mongoose");

const qualificationRowSchema =
  new mongoose.Schema(
    {
      code: {
        type: String,
        default: "",
      },

      qualification: {
        type: String,
        default: "",
      },

      institution: {
        type: String,
        default: "",
      },

      fromYear: {
        type: String,
        default: "",
      },

      toYear: {
        type: String,
        default: "",
      },

      university: {
        type: String,
        default: "",
      },

      division: {
        type: String,
        default: "First Div.",
      },

      marksPercentage: {
        type: String,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const qualificationSchema =
  new mongoose.Schema(
    {
      employeeCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      rows: {
        type: [qualificationRowSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Qualification",
    qualificationSchema
  );