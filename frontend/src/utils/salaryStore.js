const STORAGE_KEY = "employeeMasterSalaryRecords";

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
// STORAGE
// =====================================================

export const getAllRecords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const list = saved ? JSON.parse(saved) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const saveAllRecords = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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

  const sumEarn = round(EARN.reduce((s, k) => s + n[k], 0));

  if (isBlank(raw.gross)) {
    n.gross = sumEarn;
  } else if (sumEarn > 0 && Math.abs(n.gross - sumEarn) > 1) {
    errors.push(`Gross (${n.gross}) does not match earnings total (${sumEarn})`);
  }

  const sumDed = round(DEDUCT.reduce((s, k) => s + n[k], 0));

  if (isBlank(raw.totalDeductions)) {
    n.totalDeductions = sumDed;
  } else if (sumDed > 0 && Math.abs(n.totalDeductions - sumDed) > 1) {
    errors.push(
      `Total Deductions (${n.totalDeductions}) does not match deductions total (${sumDed})`
    );
  }

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
      _id: `${empCode}_${month}`,
      empCode,
      empName: String(raw.empName ?? "").trim(),
      unit: String(raw.unit ?? "").trim(),
      department: String(raw.department ?? "").trim(),
      details: raw.details || {},
      financialYear: fy,
      month,
      ...n,
      source: "excel",
    },
  };
};

const sameNumbers = (a, b) => ALL_NUM.every((k) => a[k] === b[k]);

// =====================================================
// IMPORT (dryRun = true -> sirf check)
// =====================================================

export const importRows = ({ financialYear, month, mode, dryRun, rows }) => {
  if (!MONTH_RE.test(String(month || ""))) {
    return { success: false, message: "Please select a valid month." };
  }

  if (fyOfMonth(month) !== financialYear) {
    return {
      success: false,
      message: `Month ${month} is not inside FY ${financialYear}.`,
    };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, message: "The file has no rows." };
  }

  const errors = [];
  const docs = [];
  const seen = new Map();
  let duplicatesRemoved = 0;

  rows.forEach((raw, index) => {
    const excelRow = raw._row ?? index + 2;

    const result = buildRecord(raw, month, financialYear);

    if (result.empCode) {
      const key = result.empCode.toLowerCase();

      if (seen.has(key)) {
        const previous = seen.get(key);

        // Bilkul same data wali duplicate row: chup-chap hata do
        if (result.doc && previous && sameNumbers(result.doc, previous)) {
          duplicatesRemoved += 1;
          return;
        }

        result.errors.push("Duplicate Emp Code with different data");
      } else {
        seen.set(key, result.doc || null);
      }
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
    duplicatesRemoved,
    errors,
  };

  if (errors.length > 0) {
    return { success: false, message: "Please fix the errors.", ...summary };
  }

  if (dryRun) {
    return { success: true, message: "File is OK.", ...summary };
  }

  // ---------- SAVE ----------

  const all = getAllRecords();
  const index = new Map(all.map((r, i) => [r._id, i]));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  docs.forEach((doc) => {
    if (index.has(doc._id)) {
      if (mode === "skip") {
        skipped += 1;
      } else {
        all[index.get(doc._id)] = doc;
        updated += 1;
      }
    } else {
      all.push(doc);
      added += 1;
    }
  });

  try {
    saveAllRecords(all);
  } catch {
    return {
      success: false,
      message: "Browser storage is full. Please delete old data.",
    };
  }

  return {
    success: true,
    message: "Salary imported successfully.",
    ...summary,
    added,
    updated,
    skipped,
  };
};

// =====================================================
// READ
// =====================================================

export const getEmployees = (fy) => {
  const map = new Map();

  getAllRecords()
    .filter((r) => !fy || r.financialYear === fy)
    .sort((a, b) => a.month.localeCompare(b.month))
    .forEach((r) => map.set(r.empCode, r.empName || ""));

  return [...map.entries()]
    .map(([empCode, empName]) => ({ empCode, empName }))
    .sort((a, b) => a.empCode.localeCompare(b.empCode));
};

export const getStatement = ({ fy, month, empCode }) =>
  getAllRecords()
    .filter(
      (r) =>
        (!fy || r.financialYear === fy) &&
        (!month || month === "all" || r.month === month) &&
        (!empCode || empCode === "all" || r.empCode === empCode)
    )
    .sort(
      (a, b) =>
        a.month.localeCompare(b.month) || a.empCode.localeCompare(b.empCode)
    );