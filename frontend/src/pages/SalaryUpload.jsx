import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import { CURRENT_FY, FY_OPTIONS, monthsOfFY, fmt } from "../utils/salaryUtils";
import { importRows } from "../utils/salaryStore";

import "../styles/SalaryPages.css";

// =====================================================
// FIELDS (system ke columns)
// =====================================================

const FIELDS = [
  ["", "Ignore this column"],
  ["empCode", "Emp Code *"],
  ["empName", "Emp Name"],
  ["unit", "Unit"],
  ["department", "Department"],
  ["payableDays", "Payable Days"],
  ["basic", "Basic"],
  ["hra", "HRA"],
  ["conveyance", "Conveyance"],
  ["ot", "OT"],
  ["otherEarnings", "Other Earnings (Adhoc etc.)"],
  ["gross", "Gross / Total Salary"],
  ["pfEmployee", "PF Employee"],
  ["pfEmployer", "PF Employer"],
  ["esiEmployee", "ESI Employee"],
  ["esiEmployer", "ESI Employer"],
  ["pt", "PT"],
  ["advance", "Advance / Loan"],
  ["otherDeductions", "Other Deductions"],
  ["totalDeductions", "Total Deductions"],
  ["netSalary", "Net Salary"],
];

const TEXT_FIELDS = new Set(["empCode", "empName", "unit", "department"]);

const TEMPLATE_HEADERS = [
  "Emp Code", "Emp Name", "Unit", "Payable Days",
  "Basic", "HRA", "Conveyance", "OT", "Other Earnings", "Gross",
  "PF Employee", "PF Employer", "ESI Employee", "ESI Employer",
  "PT", "Advance", "Other Deductions", "Total Deductions", "Net Salary",
];

// =====================================================
// HEADER NAME -> FIELD (automatic pehchan)
// =====================================================

const normalize = (h) => String(h ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const ALIASES = {
  empcode: "empCode", employeecode: "empCode", empid: "empCode",
  employeeid: "empCode", empno: "empCode", employeeno: "empCode",
  empnumber: "empCode", employeenumber: "empCode", ecode: "empCode", code: "empCode",
  empname: "empName", name: "empName", employeename: "empName",
  nameofemployee: "empName",
  unit: "unit",
  department: "department", departmen: "department", dept: "department",
  payabledays: "payableDays", paiddays: "payableDays", presentdays: "payableDays",
  days: "payableDays",
  basic: "basic", basicsalary: "basic", basicpay: "basic",
  hra: "hra", houserentallowance: "hra",
  conveyance: "conveyance", conv: "conveyance", conveyanceallowance: "conveyance",
  ot: "ot", overtime: "ot", otamount: "ot",
  adhoc: "otherEarnings", otherearnings: "otherEarnings",
  otherearning: "otherEarnings", otherallowance: "otherEarnings",
  otherallowances: "otherEarnings", specialallowance: "otherEarnings",
  gross: "gross", grosssalary: "gross", grosspay: "gross",
  totalearnings: "gross", totalsalary: "gross",
  pfemployee: "pfEmployee", pf: "pfEmployee", epf: "pfEmployee",
  pfemp: "pfEmployee", pfdeduction: "pfEmployee",
  pfemployer: "pfEmployer", pfcompany: "pfEmployer",
  esiemployee: "esiEmployee", esi: "esiEmployee", esiemp: "esiEmployee",
  esideduction: "esiEmployee",
  esiemployer: "esiEmployer", esicompany: "esiEmployer",
  pt: "pt", professionaltax: "pt",
  advance: "advance", advancerecovery: "advance",
  otherdeductions: "otherDeductions", otherdeduction: "otherDeductions",
  totaldeductions: "totalDeductions", totaldeduction: "totalDeductions",
  deductions: "totalDeductions", totalded: "totalDeductions",
  net: "netSalary", netsalary: "netSalary", netpay: "netSalary",
  netpayable: "netSalary",
};

const IGNORE =
  /father|account|bank|dob|birth|date|qualif|designation|payment|joining|confirm|srno|working|weekoff|holiday|category|grade/;
const LEAVES = ["cl", "el", "sl", "lwp"];

// Naam exact na mile to keywords se andaza lagao
const guessField = (header) => {
  const h = normalize(header);

  if (!h) return "";
  if (ALIASES[h]) return ALIASES[h];
  if (IGNORE.test(h) || LEAVES.includes(h)) return "";

  if (h.startsWith("emp") && /(no|num|code|id)/.test(h) && !h.includes("name")) {
    return "empCode";
  }
  if (h.includes("name")) return "empName";
  if (h.includes("depart") || h === "dept") return "department";
  if (h === "unit") return "unit";
  if (h.startsWith("net")) return "netSalary";

  // ----- DEDUCTION columns -----
  if (h.includes("deduction") || h.includes("dedc")) {
    const employer = h.includes("employer");

    if (h.includes("total")) return "totalDeductions";
    if (h.includes("esi")) return employer ? "esiEmployer" : "esiEmployee";
    if (h.includes("vpf")) return "otherDeductions";
    if (h.includes("pf")) return employer ? "pfEmployer" : "pfEmployee";
    if (h.includes("advance") || h.includes("loan")) return "advance";
    if (h.includes("professional") || /pt$/.test(h)) return "pt";

    return "otherDeductions";
  }

  // ----- EARNING columns -----
  if (h.includes("earning")) {
    if (h.includes("total")) return "gross";
    if (h.includes("day")) return "payableDays";
    if (h.includes("basic")) return "basic";
    if (h.includes("hra")) return "hra";
    if (h.includes("conv")) return "conveyance";
    if (h.includes("otnet") || h.includes("overtime")) return "ot";

    return "otherEarnings";
  }

  // ----- Plain names -----
  if (h.includes("basic")) return "basic";
  if (h.includes("hra") || h.includes("houserent")) return "hra";
  if (h.includes("conv")) return "conveyance";
  if (h.includes("overtime")) return "ot";
  if (/adhoc|allowance|incentive|bonus|arrear/.test(h)) return "otherEarnings";
  if (
    h.includes("gross") ||
    (h.includes("total") && (h.includes("salary") || h.includes("earn")))
  ) {
    return "gross";
  }

  if (h.includes("pf") && h.includes("employer")) return "pfEmployer";
  if (h.includes("pf")) return "pfEmployee";
  if (h.includes("esi") && h.includes("employer")) return "esiEmployer";
  if (h.includes("esi")) return "esiEmployee";
  if (h.includes("profession")) return "pt";
  if (h.includes("advance") || h.includes("loan")) return "advance";
  if (h.includes("payable") || h.includes("present") || h.includes("paiddays")) {
    return "payableDays";
  }

  return "";
};

// =====================================================
// HEADER ROW(S) DHUNDHO
// Header 1 row ka ho ya 2-3 rows ka, dono chalega
// =====================================================

const isNumericCell = (v) => {
  if (typeof v === "number") return true;

  const s = String(v ?? "").trim();

  return s !== "" && !Number.isNaN(Number(s.replace(/,/g, "")));
};

// Header row = kam se kam 3 naam, aur number nahi
const isHeaderLike = (cells) => {
  const filled = cells.filter((c) => String(c ?? "").trim() !== "");
  const numeric = filled.filter(isNumericCell).length;

  return filled.length >= 3 && numeric <= 1;
};

// Upar-neeche ki header rows milakar ek naam banao
const combineLabel = (rows, c) => {
  const parts = [];

  rows.forEach((r) => {
    const t = String(r[c] ?? "").trim();

    if (t && t !== "." && !parts.includes(t)) parts.push(t);
  });

  return parts.join(" ");
};

const findHeader = (book) => {
  let fallback = null;

  for (const name of book.SheetNames) {
    const grid = XLSX.utils.sheet_to_json(book.Sheets[name], {
      header: 1,
      defval: "",
      blankrows: true,
    });

    let start = -1;

    for (let i = 0; i < Math.min(grid.length, 40); i += 1) {
      if (isHeaderLike(grid[i])) {
        start = i;
        break;
      }
    }

    if (start === -1) continue;

    let end = start;

    while (
      end + 1 < grid.length &&
      end - start < 3 &&
      isHeaderLike(grid[end + 1])
    ) {
      end += 1;
    }

    const headerRows = grid.slice(start, end + 1);
    const width = Math.max(...headerRows.map((r) => r.length));

    const labels = Array.from({ length: width }, (_, c) =>
      combineLabel(headerRows, c)
    );

    const found = { grid, dataStart: end + 1, labels };

    if (labels.map(guessField).includes("empCode")) return found;

    if (!fallback) fallback = found;
  }

  return fallback;
};

// =====================================================
// MAPPING YAAD RAKHO (same layout ki file agli baar)
// "-v2": purana galat saved mapping ab use nahi hoga
// =====================================================

const memoryKey = (labels) =>
  "salaryColumnMapping-v2:" + labels.map((h) => normalize(h)).join("|");

const loadMemory = (labels) => {
  try {
    const saved = localStorage.getItem(memoryKey(labels));
    const list = saved ? JSON.parse(saved) : null;

    return Array.isArray(list) && list.length === labels.length ? list : null;
  } catch {
    return null;
  }
};

const saveMemory = (labels, mapping) => {
  try {
    localStorage.setItem(memoryKey(labels), JSON.stringify(mapping));
  } catch {
    // ignore
  }
};

// =====================================================
// MAPPING SE ROWS BANAO
// =====================================================

const isBlankValue = (v) =>
  v === undefined || v === null || String(v).trim() === "";

const toNumber = (v) => Number(String(v).replace(/,/g, "").trim());

const buildRows = (dataRows, mapping, labels, firstRowNo, autoCalc, rates) => {
  const out = [];

  dataRows.forEach((cells, i) => {
    const obj = {};

    mapping.forEach((field, c) => {
      if (!field) return;

      const value = cells[c];

      if (TEXT_FIELDS.has(field)) {
        if (isBlankValue(obj[field]) && !isBlankValue(value)) {
          obj[field] = String(value).trim();
        }
        return;
      }

      if (isBlankValue(value)) return;

      // Ek field ke liye kai columns ho to jod do
      obj[field] = (obj[field] ?? 0) + toNumber(value);
    });

    const code = String(obj.empCode ?? "").trim();

    // Total / Grand Total wali rows hata do
    if (!code || /^(grand\s*)?total/i.test(code)) return;
    if (/grand\s*total/i.test(String(obj.empName ?? ""))) return;

    obj._row = firstRowNo + i;

    // ---------- HAR COLUMN APNE NAAM SE (Statement mein dikhane ke liye) ----------
    const details = {};
    const used = {};

    labels.forEach((label, c) => {
      const field = mapping[c];

      if (field === "empCode" || field === "empName") return;

      const raw = cells[c];

      if (isBlankValue(raw)) return;

      let value;

      if (raw instanceof Date) {
        value = raw.toLocaleDateString("en-GB").replace(/\//g, "-");
      } else if (typeof raw === "number") {
        value = raw;
      } else if (/^-?[\d,]*\.?\d+$/.test(String(raw).trim())) {
        value = Number(String(raw).replace(/,/g, ""));
      } else {
        value = String(raw).trim();
      }

      // 0 save nahi karte (jagah bachane ke liye), Statement mein "-" dikhega
      if (value === 0) return;

      let key = label || `Column ${c + 1}`;

      if (key in details) {
        used[key] = (used[key] || 1) + 1;
        key = `${key} (${used[key]})`;
      }

      details[key] = value;
    });

    // ---------- PF / ESI khud nikalo (sirf jo file mein nahi hai) ----------
    if (autoCalc) {
      const basic = Number(obj.basic || 0);

      const grossValue =
        obj.gross !== undefined
          ? Number(obj.gross)
          : basic +
            Number(obj.hra || 0) +
            Number(obj.conveyance || 0) +
            Number(obj.ot || 0) +
            Number(obj.otherEarnings || 0);

      const pfBase = Math.min(basic, Number(rates.pfCeiling) || 0);
      const esiApplies = grossValue > 0 && grossValue <= Number(rates.esiLimit);

      const calc = (key, label, value) => {
        if (obj[key] !== undefined) return;

        obj[key] = value;

        if (value) details[label] = value;
      };

      calc(
        "pfEmployee",
        "PF Employee (calculated)",
        Math.round((pfBase * Number(rates.pfEmployee)) / 100)
      );
      calc(
        "pfEmployer",
        "PF Employer (calculated)",
        Math.round((pfBase * Number(rates.pfEmployer)) / 100)
      );
      calc(
        "esiEmployee",
        "ESI Employee (calculated)",
        esiApplies ? Math.ceil((grossValue * Number(rates.esiEmployee)) / 100) : 0
      );
      calc(
        "esiEmployer",
        "ESI Employer (calculated)",
        esiApplies ? Math.ceil((grossValue * Number(rates.esiEmployer)) / 100) : 0
      );
    }

    obj.details = details;

    out.push(obj);
  });

  return out;
};

const defaultMonth = (fy) => {
  const list = monthsOfFY(fy);
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return list.some((m) => m.value === current) ? current : list[0].value;
};

// =====================================================
// PAGE
// =====================================================

function SalaryUpload() {
  const [fy, setFy] = useState(CURRENT_FY);
  const [month, setMonth] = useState(defaultMonth(CURRENT_FY));
  const [mode, setMode] = useState("replace");

  const [fileName, setFileName] = useState("");
  const [labels, setLabels] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [firstRowNo, setFirstRowNo] = useState(2);
  const [mapping, setMapping] = useState([]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [autoCalc, setAutoCalc] = useState(false);
  const [rates, setRates] = useState({
    pfEmployee: 12,
    pfEmployer: 12,
    pfCeiling: 15000,
    esiEmployee: 0.75,
    esiEmployer: 3.25,
    esiLimit: 21000,
  });

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const monthOptions = monthsOfFY(fy);

  const rows = useMemo(
    () => buildRows(dataRows, mapping, labels, firstRowNo, autoCalc, rates),
    [dataRows, mapping, labels, firstRowNo, autoCalc, rates]
  );

  const hasEmpCode = mapping.includes("empCode");

  // ---------------- AUTO CHECK (file chunte hi) ----------------

  useEffect(() => {
    if (labels.length === 0) return;

    if (!hasEmpCode) {
      setResult(null);
      setMessage("Emp Code column was not found. Please open Advanced settings and choose it.");
      return;
    }

    if (rows.length === 0) {
      setResult(null);
      setMessage("No employee rows found in this file.");
      return;
    }

    const data = importRows({ financialYear: fy, month, mode, dryRun: true, rows });

    setResult(data);

    if (data.success) {
      const dup = data.duplicatesRemoved
        ? ` (${data.duplicatesRemoved} duplicate rows removed)`
        : "";

      setMessage(`File is OK. ${data.valid} employees ready${dup}. Click Import.`);
    } else {
      setMessage(
        data.invalid
          ? `${data.invalid} rows have errors (shown in red below). If a column is matched wrongly, open Advanced settings and fix it.`
          : data.message || "Failed."
      );
    }
  }, [rows, fy, month, mode, hasEmpCode, labels.length]);

  const handleFyChange = (value) => {
    setFy(value);
    setMonth(defaultMonth(value));
    setResult(null);
    setMessage("");
  };

  const clearFile = () => {
    setLabels([]);
    setDataRows([]);
    setMapping([]);
    setFileName("");
    setShowAdvanced(false);
  };

  // ---------------- TEMPLATE ----------------

  const downloadTemplate = () => {
    const sample = [
      "E001", "Sumit Kumar", "Unit 1", 26,
      18000, 7200, 1600, 1200, 0, 28000,
      2160, 2160, 0, 0,
      200, 1000, 0, 3360, 24640,
    ];

    const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, sample]);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet, "Salary");
    XLSX.writeFile(book, "salary_upload_template.xlsx");
  };

  // ---------------- READ FILE ----------------

  const handleFile = async (e) => {
    const file = e.target.files?.[0];

    setResult(null);
    setMessage("");

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const book = XLSX.read(buffer, { type: "array", cellDates: true });

      const found = findHeader(book);

      if (!found) {
        clearFile();
        setMessage(
          "Could not find the heading row in this file. Please make sure the file has column headings."
        );
        return;
      }

      const { grid, dataStart, labels: foundLabels } = found;

      const body = grid
        .slice(dataStart)
        .filter((cells) => cells.some((c) => String(c ?? "").trim() !== ""));

      const remembered = loadMemory(foundLabels);
      const guessed = remembered || foundLabels.map((l) => guessField(l));

      setLabels(foundLabels);
      setDataRows(body);
      setFirstRowNo(dataStart + 1); // Excel row number
      setMapping(guessed);
      setFileName(file.name);

      // Emp Code mila nahi to Advanced apne aap khul jaye
      setShowAdvanced(!guessed.includes("empCode"));

      setMessage(`${body.length} rows found. Checking...`);
    } catch (error) {
      console.error("EXCEL READ ERROR:", error);
      clearFile();
      setMessage("Unable to read this file.");
    }
  };

  // ---------------- CHANGE ONE MAPPING ----------------

  const changeMap = (index, field) => {
    const next = mapping.map((m, i) => (i === index ? field : m));

    setMapping(next);
    saveMemory(labels, next);
  };

  // ---------------- RESET TO AUTOMATIC ----------------

  const resetMapping = () => {
    try {
      localStorage.removeItem(memoryKey(labels));
    } catch {
      // ignore
    }

    setMapping(labels.map((l) => guessField(l)));
  };

  // ---------------- IMPORT ----------------

  const doImport = () => {
    if (rows.length === 0) {
      setMessage("No employee rows found.");
      return;
    }

    const data = importRows({ financialYear: fy, month, mode, dryRun: false, rows });

    setResult(data);

    if (data.success) {
      const dup = data.duplicatesRemoved
        ? ` (${data.duplicatesRemoved} duplicate rows removed)`
        : "";

      setMessage(
        `Imported. Added: ${data.added}, Updated: ${data.updated}, Skipped: ${data.skipped}${dup}. Open Salary Statement to view.`
      );
    } else {
      setMessage(data.message || "Failed.");
    }
  };

  const errorByRow = {};
  (result?.errors || []).forEach((e) => {
    errorByRow[e.row] = e.errors.join("; ");
  });

  const canImport = result?.success === true && result?.added === undefined;

  // ---------------- UI ----------------

  return (
    <div className="sp-page">
      <h1 className="sp-title">Salary Upload</h1>

      {/* FILTERS + FILE */}

      <div className="sp-card">
        <div className="sp-filters">
          <label className="sp-field">
            Financial Year
            <select value={fy} onChange={(e) => handleFyChange(e.target.value)}>
              {FY_OPTIONS.map((f) => (
                <option key={f} value={f}>FY {f}</option>
              ))}
            </select>
          </label>

          <label className="sp-field">
            Month
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          

          <button type="button" className="sp-btn sp-btn-light" onClick={downloadTemplate}>
            Download Template
          </button>
        </div>

        <div className="sp-filters">
          <label className="sp-field">
            Excel File
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
          </label>

          <button
            type="button"
            className="sp-btn sp-btn-green"
            disabled={!canImport}
            onClick={doImport}
          >
            Import
          </button>

          {labels.length > 0 && (
            <button
              type="button"
              className="sp-btn sp-btn-light"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide Advanced settings" : "Advanced settings"}
            </button>
          )}
        </div>

        {message && <div className="sp-message">{message}</div>}
      </div>

      {/* ADVANCED: COLUMN MATCHING + AUTO PF/ESI */}

      {labels.length > 0 && showAdvanced && (
        <>
          <div className="sp-card">
            <div className="sp-card-title">
              Column Matching
              {!hasEmpCode && (
                <span className="sp-badge" style={{ color: "#a12020" }}>
                  Please choose which column is Emp Code
                </span>
              )}
            </div>

            <button
              type="button"
              className="sp-btn sp-btn-light"
              style={{ marginBottom: 10 }}
              onClick={resetMapping}
            >
              Reset to automatic matching
            </button>

            <div className="sp-note">
              Columns are matched automatically. Change a column here only if it is matched wrongly.
              If two columns are matched to the same amount field, they are added together.
            </div>

            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Column in your file</th>
                    <th>Example value</th>
                    <th>Use as</th>
                  </tr>
                </thead>

                <tbody>
                  {labels.map((label, c) => {
                    const example = dataRows
                      .map((cells) => cells[c])
                      .find((v) => !isBlankValue(v));

                    return (
                      <tr key={c}>
                        <td>{label || `Column ${c + 1}`}</td>
                        <td>
                          {example === undefined
                            ? "-"
                            : example instanceof Date
                            ? example.toLocaleDateString("en-IN")
                            : String(example).slice(0, 30)}
                        </td>
                        <td>
                          <select
                            value={mapping[c] || ""}
                            onChange={(e) => changeMap(c, e.target.value)}
                          >
                            {FIELDS.map(([value, text]) => (
                              <option key={value} value={value}>{text}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sp-card">
            <label style={{ display: "flex", gap: "8px", alignItems: "center", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={autoCalc}
                onChange={(e) => setAutoCalc(e.target.checked)}
              />
              Calculate PF and ESI automatically (only where the file has no PF / ESI column)
            </label>

            {autoCalc && (
              <>
                <div className="sp-note">
                  Rates below are sample values. Please set them as per your company rules.
                </div>

                <div className="sp-filters">
                  {[
                    ["pfEmployee", "PF Employee %"],
                    ["pfEmployer", "PF Employer %"],
                    ["pfCeiling", "PF Basic Ceiling"],
                    ["esiEmployee", "ESI Employee %"],
                    ["esiEmployer", "ESI Employer %"],
                    ["esiLimit", "ESI Gross Limit"],
                  ].map(([key, label]) => (
                    <label className="sp-field" key={key}>
                      {label}
                      <input
                        type="number"
                        step="0.01"
                        value={rates[key]}
                        onChange={(e) =>
                          setRates((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* PREVIEW */}

      {rows.length > 0 && (
        <div className="sp-card">
          <div className="sp-card-title">
            {fileName} ({rows.length} employee rows)
            {result && (
              <span className="sp-badge">
                {result.valid ?? 0} OK, {result.invalid ?? 0} with errors
              </span>
            )}
          </div>

          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Emp Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th className="r">Gross</th>
                  <th className="r">PF</th>
                  <th className="r">ESI</th>
                  <th className="r">Net</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => {
                  const error = errorByRow[row._row];

                  const gross =
                    row.gross !== undefined
                      ? row.gross
                      : (row.basic || 0) + (row.hra || 0) + (row.conveyance || 0) +
                        (row.ot || 0) + (row.otherEarnings || 0);

                  const deductions =
                    row.totalDeductions !== undefined
                      ? row.totalDeductions
                      : (row.pfEmployee || 0) + (row.esiEmployee || 0) + (row.pt || 0) +
                        (row.advance || 0) + (row.otherDeductions || 0);

                  return (
                    <tr key={row._row} className={error ? "sp-row-error" : ""}>
                      <td>{row._row}</td>
                      <td>{row.empCode}</td>
                      <td>{row.empName}</td>
                      <td>{row.department}</td>
                      <td className="r">{fmt(gross)}</td>
                      <td className="r">{fmt(row.pfEmployee)}</td>
                      <td className="r">{fmt(row.esiEmployee)}</td>
                      <td className="r">
                        {fmt(row.netSalary !== undefined ? row.netSalary : gross - deductions)}
                      </td>
                      <td>{error ? error : result?.success ? "OK" : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryUpload;