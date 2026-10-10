const express = require("express");
const router = express.Router();

const SalaryRecord = require("../models/SalaryRecord");

// =====================================================
// HELPERS
// =====================================================

const EARN = ["basic", "hra", "conveyance", "ot", "otherEarnings"];
const DEDUCT = ["pfEmployee", "esiEmployee", "pt", "advance", "otherDeductions"];
const EXTRA = ["pfEmployer", "esiEmployer", "payableDays"];

const ALL_NUM = [
  ...EARN,
  "gross",
  ...DEDUCT,
  "totalDeductions",
  "netSalary",
  ...EXTRA,
];

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

const toNum = (v) =>
  isBlank(v) ? 0 : Number(String(v).replace(/,/g, "").trim());

const round = (n) => Math.round(n * 100) / 100;

// "2026-10" -> "2026-27"
const fyOfMonth = (month) => {
  const [y, m] = month.split("-").map(Number);
  const start = m >= 4 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
};

// =====================================================
// VALIDATE ONE ROW
// =====================================================

const buildRecord = (raw, month, fy) => {
  const errors = [];

  const empCode = String(raw.empCode ?? "").trim();

  if (!empCode) {
    errors.push("Emp Code is missing");
  }

  const n = {};

  ALL_NUM.forEach((key) => {
    const value = toNum(raw[key]);

    if (Number.isNaN(value)) {
      errors.push(`${key} is not a number`);
    } else if (value < 0) {
      errors.push(`${key} cannot be negative`);
    }

    n[key] = value;
  });

  if (errors.length) {
    return { errors, empCode };
  }

  // ---------- GROSS ----------
  const sumEarn = round(EARN.reduce((s, k) => s + n[k], 0));

  if (isBlank(raw.gross)) {
    n.gross = sumEarn;
  } else if (sumEarn > 0 && Math.abs(n.gross - sumEarn) > 1) {
    errors.push(`Gross (${n.gross}) does not match earnings total (${sumEarn})`);
  }

  // ---------- TOTAL DEDUCTIONS ----------
  const sumDed = round(DEDUCT.reduce((s, k) => s + n[k], 0));

  if (isBlank(raw.totalDeductions)) {
    n.totalDeductions = sumDed;
  } else if (sumDed > 0 && Math.abs(n.totalDeductions - sumDed) > 1) {
    errors.push(
      `Total Deductions (${n.totalDeductions}) does not match deductions total (${sumDed})`
    );
  }

  // ---------- NET ----------
  const expectedNet = round(n.gross - n.totalDeductions);

  if (isBlank(raw.netSalary)) {
    n.netSalary = expectedNet;
  } else if (Math.abs(n.netSalary - expectedNet) > 1) {
    errors.push(`Net Salary (${n.netSalary}) should be Gross - Deductions (${expectedNet})`);
  }

  if (errors.length) {
    return { errors, empCode };
  }

  return {
    errors: [],
    empCode,
    doc: {
      empCode,
      empName: String(raw.empName ?? "").trim(),
      unit: String(raw.unit ?? "").trim(),
      financialYear: fy,
      month,
      ...n,
      source: "excel",
    },
  };
};

// =====================================================
// IMPORT (dryRun = true -> sirf check)
// POST /api/salary-records/import
// =====================================================

router.post("/import", async (req, res) => {
  try {
    const { financialYear, month, mode, dryRun, rows } = req.body;

    if (!MONTH_RE.test(String(month || ""))) {
      return res.status(400).json({ success: false, message: "Please select a valid month." });
    }

    if (fyOfMonth(month) !== financialYear) {
      return res.status(400).json({
        success: false,
        message: `Month ${month} is not inside FY ${financialYear}.`,
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: "The file has no rows." });
    }

    const errors = [];
    const docs = [];
    const seen = new Set();

    rows.forEach((raw, index) => {
      const excelRow = index + 2; // header = row 1

      const result = buildRecord(raw, month, financialYear);

      if (result.empCode) {
        const key = result.empCode.toLowerCase();

        if (seen.has(key)) {
          result.errors.push("Duplicate Emp Code in the same file");
        }

        seen.add(key);
      }

      if (result.errors.length) {
        errors.push({ row: excelRow, empCode: result.empCode, errors: result.errors });
      } else {
        docs.push(result.doc);
      }
    });

    const summary = {
      total: rows.length,
      valid: docs.length,
      invalid: errors.length,
      errors,
    };

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the errors.", ...summary });
    }

    if (dryRun) {
      return res.json({ success: true, message: "File is OK.", ...summary });
    }

    // ---------- SAVE ----------

    const ops = docs.map((doc) => ({
      updateOne: {
        filter: { empCode: doc.empCode, month },
        update: mode === "skip" ? { $setOnInsert: doc } : { $set: doc },
        upsert: true,
      },
    }));

    const result = await SalaryRecord.bulkWrite(ops);

    return res.json({
      success: true,
      message: "Salary imported successfully.",
      ...summary,
      added: result.upsertedCount || 0,
      updated: mode === "skip" ? 0 : result.modifiedCount || 0,
      skipped: mode === "skip" ? result.matchedCount || 0 : 0,
    });
  } catch (error) {
    console.error("SALARY IMPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Import failed.",
    });
  }
});

// =====================================================
// EMPLOYEES OF A FY (dropdown ke liye)
// GET /api/salary-records/employees?fy=2026-27
// =====================================================

router.get("/employees", async (req, res) => {
  try {
    const { fy } = req.query;

    const filter = fy ? { financialYear: fy } : {};

    const list = await SalaryRecord.aggregate([
      { $match: filter },
      { $sort: { month: 1 } },
      { $group: { _id: "$empCode", empName: { $last: "$empName" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(list.map((e) => ({ empCode: e._id, empName: e.empName || "" })));
  } catch (error) {
    console.error("SALARY EMPLOYEES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// =====================================================
// STATEMENT
// GET /api/salary-records/statement?fy=2026-27&month=2026-10&empCode=E001
// =====================================================

router.get("/statement", async (req, res) => {
  try {
    const { fy, month, empCode } = req.query;

    const filter = {};

    if (fy) filter.financialYear = fy;
    if (month && month !== "all") filter.month = month;
    if (empCode && empCode !== "all") filter.empCode = empCode;

    const rows = await SalaryRecord.find(filter)
      .sort({ month: 1, empCode: 1 })
      .lean();

    res.json({ success: true, rows });
  } catch (error) {
    console.error("SALARY STATEMENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;