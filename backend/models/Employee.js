
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // ==========================================
    // EMPLOYEE DETAILS
    // ==========================================

    unitCode: {
      type: String,
      trim: true,
      default: "",
    },

    employeeCode: {
      type: String,
      trim: true,
      required: true,
    },

    employeeName: {
      type: String,
      trim: true,
      required: true,
    },

    fatherName: {
      type: String,
      trim: true,
      default: "",
    },

    dob: {
      type: Date,
      default: null,
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

    aadhar: {
      type: String,
      trim: true,
      default: "",
    },

    contactNo: {
      type: String,
      trim: true,
      default: "",
    },

    mailId: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // MASTER DATA
    // ==========================================

    departmentCode: {
      type: String,
      trim: true,
      required: true,
    },

    contractorCode: {
      type: String,
      trim: true,
      default: "",
    },

    assignedShift: {
      type: String,
      trim: true,
      default: "",
    },

    designation: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    reportingPerson: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // PF / ESI / SALARY
    // ==========================================

    basicSalary: {
      type: Number,
      default: 0,
    },

    pfApplicable: {
      type: Boolean,
      default: false,
    },

    pfNumber: {
      type: String,
      trim: true,
      default: "",
    },

    esiApplicable: {
      type: Boolean,
      default: false,
    },

    esiNumber: {
      type: String,
      trim: true,
      default: "",
    },

    effectiveDate: {
      type: Date,
      default: null,
    },

    // ==========================================
    // EXCEL / CSV EXTRA COLUMNS
    // ==========================================
    // Agar Excel/CSV mein future mein koi
    // additional column aaye, jaise:
    //
    // Skill
    // Grade
    // Experience
    // Location
    //
    // to woh yahan preserve hoga.
    // ==========================================

    excelData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },

  {
    timestamps: true,

    // Unknown fields ko directly Employee
    // document mein add nahi karenge.
    // Extra Excel/CSV fields excelData mein jayenge.
    strict: true,
  }
);

module.exports =
  mongoose.model(
    "Employee",
    employeeSchema
  );

