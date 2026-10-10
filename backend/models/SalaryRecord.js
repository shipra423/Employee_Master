const mongoose = require("mongoose");

const num = { type: Number, default: 0 };

const salaryRecordSchema = new mongoose.Schema(
  {
    empCode: { type: String, required: true, trim: true },
    empName: { type: String, default: "", trim: true },
    unit: { type: String, default: "", trim: true },

    financialYear: { type: String, required: true }, // 2026-27
    month: { type: String, required: true },          // 2026-10

    payableDays: num,

    basic: num,
    hra: num,
    conveyance: num,
    ot: num,
    otherEarnings: num,
    gross: num,

    pfEmployee: num,
    pfEmployer: num,
    esiEmployee: num,
    esiEmployer: num,
    pt: num,
    advance: num,
    otherDeductions: num,
    totalDeductions: num,

    netSalary: num,

    source: { type: String, default: "excel" }, // excel / processed
  },
  { timestamps: true }
);

// Ek employee ka ek month mein ek hi record
salaryRecordSchema.index({ empCode: 1, month: 1 }, { unique: true });
salaryRecordSchema.index({ financialYear: 1, month: 1 });

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);