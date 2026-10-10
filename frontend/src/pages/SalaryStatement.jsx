import { useEffect, useMemo, useRef, useState } from "react";

import {
  CURRENT_FY,
  FY_OPTIONS,
  monthsOfFY,
  monthLabel,
  fmt,
} from "../utils/salaryUtils";

import { getEmployees, getStatement } from "../utils/salaryStore";

import * as XLSX from "xlsx";

import "../styles/SalaryPages.css";

const PICK_KEY = "salaryStatementColumns";

// Salary data isi key mein save hota hai (salaryStore.js wali hi key)
const STORAGE_KEY = "employeeMasterSalaryRecords";

// Itne se zyada records hatane par DELETE type karna padega
const TYPE_TO_CONFIRM_ABOVE = 10;

// ---------------- DATA PADHNA ----------------

const readAllRecords = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const list = saved ? JSON.parse(saved) : [];

    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

// Ye naam wale columns rupaye nahi hote
const NOT_AMOUNT =
  /account|sr\.?\s*no|srno|number|mobile|phone|pan|uan|aadhaar|aadhar|pincode/i;

// Active / Inactive pehchanne ke liye
const STATUS_LABEL = /status|^active$|inactive/i;

const EXIT_LABEL =
  /resign|\bleft\b|leaving|exit|relieving|separation|terminat/i;

const INACTIVE_TEXT =
  /inactive|in-active|left|resign|terminat|abscond|relieved|exit|^(no|n|0|false)$/i;

// Purane records ke liye
const STANDARD = [
  ["payableDays", "Payable Days"],
  ["basic", "Basic"],
  ["hra", "HRA"],
  ["conveyance", "Conveyance"],
  ["ot", "OT"],
  ["otherEarnings", "Other Earnings"],
  ["gross", "Gross"],
  ["pfEmployee", "PF Employee"],
  ["pfEmployer", "PF Employer"],
  ["esiEmployee", "ESI Employee"],
  ["esiEmployer", "ESI Employer"],
  ["pt", "PT"],
  ["advance", "Advance"],
  ["otherDeductions", "Other Deductions"],
  ["totalDeductions", "Total Deductions"],
  ["netSalary", "Net Salary"],
];

// Quick selection buttons
const PRESETS = [
  ["PF", /pf/i],
  ["ESI", /esi/i],
  ["Earnings", /earning|basic|hra|conv|adhoc|gross|incentive|bonus/i],
  ["Deductions", /deduction|pf|esi|advance|loan|tax|canteen/i],
  ["Net Salary", /gross|net|total/i],
];

const detailsOf = (r) => {
  if (r.details && Object.keys(r.details).length > 0) {
    return r.details;
  }

  const out = {};

  if (r.department) out.Department = r.department;

  STANDARD.forEach(([key, label]) => {
    if (r[key] !== undefined && r[key] !== null) {
      out[label] = r[key];
    }
  });

  return out;
};

// Chhote buttons ka style (Up / Down / Top)
const miniBtn = {
  padding: "3px 8px",
  border: "1px solid #1f5fa8",
  borderRadius: 5,
  background: "#fff",
  color: "#1f5fa8",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

// =====================================================
// PAGE
// =====================================================

function SalaryStatement() {
  const [fy, setFy] = useState(CURRENT_FY);
  const [month, setMonth] = useState("all");
  const [empCode, setEmpCode] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  // Message bar + delete confirmation
  const [notice, setNotice] = useState("");
  const [confirmBox, setConfirmBox] = useState(null); // { kind, count }
  const [confirmText, setConfirmText] = useState("");

  // Synchronized scrollbars
  const topScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Saved column selection (ORDER bhi yahi hai)
  // null = saare columns file ke order mein
  const [picked, setPicked] = useState(() => {
    try {
      const saved = localStorage.getItem(PICK_KEY);
      const list = saved ? JSON.parse(saved) : null;

      return Array.isArray(list) ? list : null;
    } catch {
      return null;
    }
  });

  const updatePicked = (list) => {
    setPicked(list);

    try {
      if (list === null) {
        localStorage.removeItem(PICK_KEY);
      } else {
        localStorage.setItem(PICK_KEY, JSON.stringify(list));
      }
    } catch {
      // Ignore storage errors
    }
  };

  const employees = useMemo(() => getEmployees(fy), [fy, refresh]);

  const rows = useMemo(
    () =>
      getStatement({ fy, month, empCode }).map((r) => ({
        ...r,
        d: detailsOf(r),
      })),
    [fy, month, empCode, refresh]
  );

  // Browser mein kul kitne records saved hain
  const storedCount = useMemo(
    () => readAllRecords().length,
    [refresh, rows]
  );

  // All columns in file order
  const columns = useMemo(() => {
    const map = new Map();

    rows.forEach((r) => {
      Object.entries(r.d).forEach(([label, value]) => {
        if (!map.has(label)) {
          map.set(label, {
            label,
            numeric: !NOT_AMOUNT.test(label),
          });
        }

        if (typeof value !== "number" && value !== undefined && value !== null) {
          map.get(label).numeric = false;
        }
      });
    });

    return [...map.values()];
  }, [rows]);

  const allLabels = columns.map((c) => c.label);

  // ---------------- ORDER: chune hue columns, aapke order mein ----------------

  const orderedSelection = useMemo(() => {
    const base = picked === null ? allLabels : picked;

    return base.filter((l) => allLabels.includes(l));
  }, [picked, allLabels]);

  const visible = useMemo(() => {
    if (picked === null) return columns;
    if (picked.length === 0) return [];

    // picked ke order mein columns lagao
    const list = orderedSelection
      .map((label) => columns.find((c) => c.label === label))
      .filter(Boolean);

    // Chune hue columns is data mein nahi hain (alag layout) -> saare dikhao
    return list.length > 0 ? list : columns;
  }, [columns, picked, orderedSelection]);

  // Add / remove (add karne par list ke aakhir mein judta hai)
  const toggleColumn = (label) => {
    const next = orderedSelection.includes(label)
      ? orderedSelection.filter((l) => l !== label)
      : [...orderedSelection, label];

    updatePicked(next);
  };

  // Column ko kisi bhi position par rakho (position 1 se shuru)
  const setPosition = (label, position) => {
    const list = orderedSelection.filter((l) => l !== label);
    const index = Math.min(Math.max(position - 1, 0), list.length);

    list.splice(index, 0, label);

    updatePicked(list);
  };

  const moveColumn = (label, direction) => {
    const index = orderedSelection.indexOf(label);

    if (index === -1) return;

    if (direction === "top") {
      setPosition(label, 1);
    } else if (direction === "up") {
      setPosition(label, index);
    } else if (direction === "down") {
      setPosition(label, index + 2);
    }
  };

  const applyPreset = (regex) => {
    updatePicked(
      columns.filter((c) => regex.test(c.label)).map((c) => c.label)
    );
  };

  // Basic salary column
  const basicColumn = useMemo(() => {
    const amountColumns = columns.filter((c) => c.numeric);

    return (
      amountColumns.find((c) =>
        /^(earning\s)?basic(\ssalary)?$/i.test(c.label.trim())
      ) ||
      amountColumns.find((c) => /basic/i.test(c.label)) ||
      null
    );
  }, [columns]);

  // Total / Active / Inactive employees
  const employeeStats = useMemo(() => {
    const latestByEmp = new Map();

    rows.forEach((r) => {
      const prev = latestByEmp.get(r.empCode);

      if (!prev || r.month > prev.month) {
        latestByEmp.set(r.empCode, r);
      }
    });

    const list = [...latestByEmp.values()];
    const total = list.length;
    const labels = columns.map((c) => c.label);

    const statusLabel = labels.find((l) => STATUS_LABEL.test(l.trim()));
    const exitLabel = labels.find((l) => EXIT_LABEL.test(l));

    // 1. Status / Active column
    if (statusLabel) {
      const numericOnly = rows.every(
        (r) =>
          r.d[statusLabel] === undefined ||
          typeof r.d[statusLabel] === "number"
      );

      let inactive = 0;

      list.forEach((r) => {
        const v = r.d[statusLabel];

        const off = numericOnly
          ? !v
          : v !== undefined && INACTIVE_TEXT.test(String(v).trim());

        if (off) inactive += 1;
      });

      return {
        total,
        active: total - inactive,
        inactive,
        basis: `as per "${statusLabel}" column`,
      };
    }

    // 2. Resign / Left / Exit column
    if (exitLabel) {
      let inactive = 0;

      list.forEach((r) => {
        const v = r.d[exitLabel];

        if (v !== undefined && String(v).trim() !== "") {
          inactive += 1;
        }
      });

      return {
        total,
        active: total - inactive,
        inactive,
        basis: `as per "${exitLabel}" column`,
      };
    }

    // 3. Salary in latest month
    const latestMonth = rows.reduce(
      (m, r) => (r.month > m ? r.month : m),
      ""
    );

    const activeSet = new Set(
      rows.filter((r) => r.month === latestMonth).map((r) => r.empCode)
    );

    return {
      total,
      active: activeSet.size,
      inactive: total - activeSet.size,
      basis: "as per salary in latest month",
    };
  }, [rows, columns]);

  // Measure horizontal scrollbar width
  useEffect(() => {
    const measure = () => {
      if (bodyScrollRef.current) {
        setScrollWidth(bodyScrollRef.current.scrollWidth);
      }
    };

    measure();

    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, [rows, visible]);

  const syncFromTop = () => {
    if (topScrollRef.current && bodyScrollRef.current) {
      bodyScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const syncFromBody = () => {
    if (topScrollRef.current && bodyScrollRef.current) {
      topScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  };

  const handleFyChange = (value) => {
    setFy(value);
    setMonth("all");
    setEmpCode("all");
    setConfirmBox(null);
  };

  const total = (label) =>
    rows.reduce(
      (sum, r) => sum + (typeof r.d[label] === "number" ? r.d[label] : 0),
      0
    );

  // ---------------- REFRESH ----------------

  const handleRefresh = () => {
    setConfirmBox(null);
    setRefresh((n) => n + 1);

    const inSelection = getStatement({ fy, month, empCode }).length;

    setNotice(
      `Refreshed. ${readAllRecords().length} records saved in this browser, ${inSelection} in the current selection.`
    );
  };

  // ---------------- DOWNLOAD EXCEL (aapke order mein) ----------------

  const downloadExcel = () => {
    if (rows.length === 0) {
      setNotice("No salary data to download for this selection.");
      return;
    }

    const headers = ["Emp Code", "Name", "Month", ...visible.map((c) => c.label)];

    const data = rows.map((r) => [
      r.empCode ?? "",
      r.empName ?? "",
      monthLabel(r.month),
      ...visible.map((c) => {
        const value = r.d[c.label];

        return value === undefined || value === null ? "" : value;
      }),
    ]);

    const totalRow = [
      "Total",
      "",
      "",
      ...visible.map((c) => (c.numeric ? total(c.label) : "")),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data, totalRow]);

    worksheet["!cols"] = headers.map((header) => ({
      wch: Math.max(String(header).length + 3, 14),
    }));

    worksheet["!autofilter"] = {
      ref: `A1:${XLSX.utils.encode_col(headers.length - 1)}${data.length + 1}`,
    };

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Statement");

    const safeMonth = month === "all" ? "All_Months" : month;
    const safeEmployee = empCode === "all" ? "All_Employees" : empCode;

    XLSX.writeFile(
      workbook,
      `Salary_Statement_FY_${fy}_${safeMonth}_${safeEmployee}.xlsx`
    );

    setNotice("Excel file downloaded.");
  };

  // ---------------- DELETE: PEHLE CONFIRM BOX KHOLO ----------------

  const askDelete = (kind) => {
    const count =
      kind === "all"
        ? readAllRecords().length
        : getStatement({ fy, month, empCode }).length;

    if (count === 0) {
      setConfirmBox(null);
      setNotice(
        kind === "all"
          ? "There is no uploaded salary data to delete."
          : "No salary data found for this selection, so nothing to delete."
      );
      return;
    }

    setNotice("");
    setConfirmText("");
    setConfirmBox({ kind, count });
  };

  // ---------------- DELETE: "Yes, delete" dabane par ----------------

  const confirmDelete = () => {
    if (!confirmBox) return;

    const needTyping =
      confirmBox.kind === "all" || confirmBox.count > TYPE_TO_CONFIRM_ABOVE;

    if (needTyping && confirmText.trim().toUpperCase() !== "DELETE") {
      setNotice("Please type DELETE in the box to confirm.");
      return;
    }

    try {
      if (confirmBox.kind === "all") {
        localStorage.removeItem(STORAGE_KEY);

        setNotice(`${confirmBox.count} records deleted (all data).`);
      } else {
        const all = readAllRecords();

        const keep = all.filter(
          (r) =>
            !(
              r.financialYear === fy &&
              (month === "all" || r.month === month) &&
              (empCode === "all" || r.empCode === empCode)
            )
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(keep));

        setNotice(`${all.length - keep.length} records deleted.`);
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      setNotice("Could not delete. Please try again.");
      return;
    }

    setConfirmBox(null);
    setConfirmText("");
    setEmpCode("all");

    if (confirmBox.kind === "all") setMonth("all");

    setRefresh((n) => n + 1);
  };

  const cancelDelete = () => {
    setConfirmBox(null);
    setConfirmText("");
    setNotice("Delete cancelled. Nothing was deleted.");
  };

  const needTyping =
    confirmBox &&
    (confirmBox.kind === "all" || confirmBox.count > TYPE_TO_CONFIRM_ABOVE);

  // Summary cards
  const otherCards = visible
    .filter(
      (c) => c.numeric && (!basicColumn || c.label !== basicColumn.label)
    )
    .slice(-3);

  // ---------------- UI ----------------

  return (
    <div className="sp-page">
      <h1 className="sp-title">Report</h1>

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
              <option value="all">All months of FY</option>
              {monthsOfFY(fy).map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>

          <label className="sp-field">
            Employee
            <select value={empCode} onChange={(e) => setEmpCode(e.target.value)}>
              <option value="all">All Employees</option>
              {employees.map((e) => (
                <option key={e.empCode} value={e.empCode}>
                  {e.empCode} - {e.empName}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="sp-btn"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            Choose Columns ({visible.length} of {columns.length})
          </button>

          <button
            type="button"
            className="sp-btn sp-btn-light"
            onClick={handleRefresh}
          >
            Refresh
          </button>

          <button type="button" className="sp-btn" onClick={downloadExcel}>
            Download Excel
          </button>

          <button
            type="button"
            className="sp-btn"
            style={{ background: "#c0392b", borderColor: "#c0392b", color: "#fff" }}
            onClick={() => askDelete("selected")}
            title="Delete the data of the selected Financial Year, Month and Employee"
          >
            Delete Data
          </button>

          <button
            type="button"
            className="sp-btn"
            style={{ background: "#fff", borderColor: "#c0392b", color: "#c0392b" }}
            onClick={() => askDelete("all")}
            title="Delete all uploaded salary data of all years"
          >
            Delete All
          </button>
        </div>

        <div className="sp-note" style={{ marginTop: 0 }}>
          Records saved in this browser: <b>{storedCount}</b> | Showing now: <b>{rows.length}</b>
        </div>

        {/* MESSAGE BAR */}

        {notice && (
          <div
            className="sp-message"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
              aria-label="Close message"
            >
              x
            </button>
          </div>
        )}

        {/* DELETE CONFIRMATION */}

        {confirmBox && (
          <div
            style={{
              border: "1px solid #c0392b",
              background: "#fdf2f1",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 700, color: "#a12020", marginBottom: 6 }}>
              {confirmBox.kind === "all"
                ? "Delete ALL uploaded salary data?"
                : "Delete the selected salary data?"}
            </div>

            {confirmBox.kind === "all" ? (
              <div>
                Records: <b>{confirmBox.count}</b> (all financial years and months)
              </div>
            ) : (
              <div>
                Financial Year: <b>FY {fy}</b> | Month:{" "}
                <b>{month === "all" ? "All months of FY" : monthLabel(month)}</b> | Employee:{" "}
                <b>{empCode === "all" ? "All employees" : empCode}</b> | Records:{" "}
                <b>{confirmBox.count}</b>
              </div>
            )}

            <div style={{ color: "#5b6676", margin: "6px 0 8px" }}>
              This cannot be undone. Tip: click Download Excel first to keep a copy.
            </div>

            {needTyping && (
              <div style={{ marginBottom: 8 }}>
                Type <b>DELETE</b> to confirm:{" "}
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    padding: "6px 8px",
                    border: "1px solid #c5ced9",
                    borderRadius: 6,
                    width: 140,
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="sp-btn"
                style={{ background: "#c0392b", borderColor: "#c0392b", color: "#fff" }}
                onClick={confirmDelete}
              >
                Yes, delete
              </button>

              <button
                type="button"
                className="sp-btn sp-btn-light"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* COLUMN PICKER (order ke saath) */}

        {panelOpen && (
          <div className="sp-cols-panel">
            <div className="sp-cols-actions">
              <b>Quick select:</b>

              <button type="button" className="sp-chip" onClick={() => updatePicked(null)}>
                All (file order)
              </button>

              <button type="button" className="sp-chip" onClick={() => updatePicked([])}>
                None
              </button>

              {PRESETS.map(([name, regex]) => (
                <button
                  type="button"
                  key={name}
                  className="sp-chip"
                  onClick={() => applyPreset(regex)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* LEFT: kaunse columns chahiye */}

              <div style={{ flex: "1 1 260px", minWidth: 240 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  1. Tick the columns you want
                </div>

                <div
                  className="sp-cols-grid"
                  style={{ gridTemplateColumns: "1fr", maxHeight: 320 }}
                >
                  {columns.map((c) => (
                    <label key={c.label} className="sp-col-item">
                      <input
                        type="checkbox"
                        checked={orderedSelection.includes(c.label)}
                        onChange={() => toggleColumn(c.label)}
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* RIGHT: order */}

              <div style={{ flex: "1 1 360px", minWidth: 300 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  2. Set the order (1 = first column in the report)
                </div>

                {orderedSelection.length === 0 ? (
                  <div className="sp-note" style={{ margin: 0 }}>
                    No column selected. Tick columns on the left.
                  </div>
                ) : (
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {orderedSelection.map((label, index) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "4px 0",
                          borderBottom: "1px solid #e6ebf1",
                          fontSize: 13,
                        }}
                      >
                        <select
                          value={index + 1}
                          onChange={(e) => setPosition(label, Number(e.target.value))}
                          style={{
                            width: 56,
                            padding: "3px 4px",
                            border: "1px solid #c5ced9",
                            borderRadius: 5,
                            fontSize: 12,
                          }}
                          title="Position in the report"
                        >
                          {orderedSelection.map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>

                        <span style={{ flex: 1, minWidth: 0 }}>{label}</span>

                        <button
                          type="button"
                          style={miniBtn}
                          onClick={() => moveColumn(label, "top")}
                          disabled={index === 0}
                        >
                          Top
                        </button>

                        <button
                          type="button"
                          style={miniBtn}
                          onClick={() => moveColumn(label, "up")}
                          disabled={index === 0}
                        >
                          Up
                        </button>

                        <button
                          type="button"
                          style={miniBtn}
                          onClick={() => moveColumn(label, "down")}
                          disabled={index === orderedSelection.length - 1}
                        >
                          Down
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sp-note">
              The table and the Excel download follow this order. Emp Code, Name and Month are always shown first.
              Columns you tick later are added at the end. Your choice is remembered.
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY CARDS */}

      <div className="sp-cards">
        <div className="sp-kpi sp-kpi-emp">
          <div className="sp-kpi-label">Total Employees</div>
          <div className="sp-kpi-value">{employeeStats.total}</div>

          <div className="sp-kpi-split">
            <div className="sp-split-half">
              <div className="sp-split-label">Active</div>
              <div className="sp-split-num sp-num-active">
                {employeeStats.active}
              </div>
            </div>

            <div className="sp-split-half">
              <div className="sp-split-label">Inactive</div>
              <div className="sp-split-num sp-num-inactive">
                {employeeStats.inactive}
              </div>
            </div>
          </div>

          {employeeStats.total > 0 && (
            <div className="sp-kpi-basis">{employeeStats.basis}</div>
          )}
        </div>

        {basicColumn && (
          <div className="sp-kpi">
            <div className="sp-kpi-label">Basic Salary</div>
            <div className="sp-kpi-value">{fmt(total(basicColumn.label))}</div>
          </div>
        )}

        {otherCards.map((c) => (
          <div className="sp-kpi" key={c.label}>
            <div className="sp-kpi-label">{c.label}</div>
            <div className="sp-kpi-value">{fmt(total(c.label))}</div>
          </div>
        ))}
      </div>

      {/* TABLE */}

      <div className="sp-card" style={{ padding: 0 }}>
        {rows.length === 0 && (
          <div className="sp-message">
            No salary data found for this selection. Please upload salary first.
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* TOP SCROLLBAR */}

            <div
              className="sp-top-scroll"
              ref={topScrollRef}
              onScroll={syncFromTop}
            >
              <div style={{ width: scrollWidth, height: 1 }} />
            </div>

            {/* TABLE */}

            <div
              className="sp-scroll"
              ref={bodyScrollRef}
              onScroll={syncFromBody}
            >
              <table className="sp-table">
                <thead>
                  <tr>
                    <th className="sp-s1">Emp Code</th>
                    <th className="sp-s2">Name</th>
                    <th>Month</th>

                    {visible.map((c) => (
                      <th key={c.label} className={c.numeric ? "r" : ""}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id}>
                      <td className="sp-s1">{r.empCode}</td>
                      <td className="sp-s2">{r.empName}</td>
                      <td>{monthLabel(r.month)}</td>

                      {visible.map((c) => {
                        const value = r.d[c.label];

                        return (
                          <td key={c.label} className={c.numeric ? "r" : ""}>
                            {value === undefined || value === null
                              ? "-"
                              : c.numeric && typeof value === "number"
                              ? fmt(value)
                              : String(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="sp-total">
                    <td className="sp-s1" colSpan={2}>Total</td>
                    <td></td>

                    {visible.map((c) => (
                      <td key={c.label} className={c.numeric ? "r" : ""}>
                        {c.numeric ? fmt(total(c.label)) : ""}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SalaryStatement;