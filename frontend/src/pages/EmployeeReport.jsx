import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Search,
  RotateCcw,
  Download,
} from "lucide-react";
import "./EmployeeReport.css";

const EMPLOYEE_API = "http://localhost:5000/api/employees";
const BANK_API = "http://localhost:5000/api/bank-details";
const QUALIFICATION_API =
  "http://localhost:5000/api/qualifications";

function EmployeeReport({ onEmployeeInformation }) {
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState([]);

  const [employeeId, setEmployeeId] = useState("All");
  const [department, setDepartment] = useState("All");
  const [designation, setDesignation] = useState("All");
  const [category, setCategory] = useState("All");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EMPLOYEE DATA
  // =====================================================

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(EMPLOYEE_API);

      if (!response.ok) {
        throw new Error("Failed to load employee data.");
      }

      const data = await response.json();

      const employeeList = Array.isArray(data)
        ? data
        : [];

      setEmployees(employeeList);
      setReportData(employeeList);
    } catch (err) {
      console.error("Employee Report Error:", err);

      setError(
        "Failed to load employee data. Please check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // =====================================================
  // UNIQUE DROPDOWN VALUES
  // =====================================================

  const employeeIds = [
    ...new Set(
      employees
        .map((item) => item.employeeCode)
        .filter(Boolean)
    ),
  ];

  const departments = [
    ...new Set(
      employees
        .map((item) => item.departmentCode)
        .filter(Boolean)
    ),
  ];

  const designations = [
    ...new Set(
      employees
        .map((item) => item.designation)
        .filter(Boolean)
    ),
  ];

  const categories = [
    ...new Set(
      employees
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // DATE HELPER
  // =====================================================

  const getDateOnly = (value) => {
    if (!value) return "";

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      return value;
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // FILTER EMPLOYEES
  // =====================================================

  const getFilteredEmployees = () => {
    let filtered = [...employees];

    // Employee ID
    if (employeeId !== "All") {
      filtered = filtered.filter(
        (employee) =>
          String(employee.employeeCode || "")
            .trim()
            .toLowerCase() ===
          String(employeeId)
            .trim()
            .toLowerCase()
      );
    }

    // Department
    if (department !== "All") {
      filtered = filtered.filter(
        (employee) =>
          String(employee.departmentCode || "")
            .trim()
            .toLowerCase() ===
          String(department)
            .trim()
            .toLowerCase()
      );
    }

    // Designation
    if (designation !== "All") {
      filtered = filtered.filter(
        (employee) =>
          String(employee.designation || "")
            .trim()
            .toLowerCase() ===
          String(designation)
            .trim()
            .toLowerCase()
      );
    }

    // Category
    if (category !== "All") {
      filtered = filtered.filter(
        (employee) =>
          String(employee.category || "")
            .trim()
            .toLowerCase() ===
          String(category)
            .trim()
            .toLowerCase()
      );
    }

    // Date Filter
    if (fromDate || toDate) {
      filtered = filtered.filter((employee) => {
        const employeeDate = getDateOnly(
          employee.joiningDate ||
            employee.creationDate
        );

        if (!employeeDate) {
          return false;
        }

        if (
          fromDate &&
          employeeDate < fromDate
        ) {
          return false;
        }

        if (
          toDate &&
          employeeDate > toDate
        ) {
          return false;
        }

        return true;
      });
    }

    return filtered;
  };

  // =====================================================
  // FETCH REPORT
  // =====================================================

  const handleFetchReport = () => {
    setError("");
    setMessage("");

    const filtered = getFilteredEmployees();

    setReportData(filtered);

    setMessage(
      `${filtered.length} employee record(s) found.`
    );
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setEmployeeId("All");
    setDepartment("All");
    setDesignation("All");
    setCategory("All");

    setFromDate("");
    setToDate("");

    setReportData(employees);

    setMessage("");
    setError("");
  };

  // =====================================================
  // LOAD BANK DETAIL
  // =====================================================

  const loadBankDetail = async (employeeCode) => {
    if (!employeeCode) {
      return null;
    }

    try {
      const response = await fetch(
        `${BANK_API}/employee/${encodeURIComponent(
          employeeCode
        )}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return data || null;
    } catch (err) {
      console.error(
        "Bank Detail Report Error:",
        employeeCode,
        err
      );

      return null;
    }
  };

  // =====================================================
  // LOAD QUALIFICATION
  // =====================================================

  const loadQualification = async (
    employeeCode
  ) => {
    if (!employeeCode) {
      return null;
    }

    try {
      const response = await fetch(
        `${QUALIFICATION_API}/employee/${encodeURIComponent(
          employeeCode
        )}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return {
          rows: data,
        };
      }

      return data || null;
    } catch (err) {
      console.error(
        "Qualification Report Error:",
        employeeCode,
        err
      );

      return null;
    }
  };

  // =====================================================
  // CREATE COMPLETE EXCEL DATA
  // =====================================================

  const createExcelData = async (
    filteredEmployees
  ) => {
    const finalExcelData = [];

    for (const employee of filteredEmployees) {
      const employeeCode =
        employee.employeeCode || "";

      // Load Bank + Qualification
      const [bankDetail, qualificationData] =
        await Promise.all([
          loadBankDetail(employeeCode),
          loadQualification(employeeCode),
        ]);

      // Qualification rows
      const qualificationRows =
        Array.isArray(
          qualificationData?.rows
        )
          ? qualificationData.rows
          : [];

      // If qualification is not available,
      // still create ONE row so that
      // Employee + Bank columns are exported.
      const rowsToExport =
        qualificationRows.length > 0
          ? qualificationRows
          : [
              {
                code: "",
                qualification: "",
                institution: "",
                fromYear: "",
                toYear: "",
                university: "",
                division: "",
                marksPercentage: "",
              },
            ];

      rowsToExport.forEach(
        (qualification) => {
          finalExcelData.push({
            // =================================================
            // EMPLOYEE DETAILS
            // =================================================

            "Unit Code":
              employee.unitCode || "",

            "Employee ID":
              employee.employeeCode || "",

            "Employee Name":
              employee.employeeName || "",

            "Father Name":
              employee.fatherName || "",

            DOB: getDateOnly(
              employee.dob
            ),

            Aadhaar:
              employee.aadhar || "",

            "Contact No":
              employee.contactNo || "",

            "Mail ID":
              employee.mailId || "",

            "Department Code":
              employee.departmentCode || "",

            "Contractor Code":
              employee.contractorCode || "",

            "Assigned Shift":
              employee.assignedShift || "",

            Designation:
              employee.designation || "",

            Category:
              employee.category || "",

            "Reporting Person":
              employee.reportingPerson || "",

            "Joining Date":
              getDateOnly(
                employee.joiningDate
              ),

            "Resign Date":
              getDateOnly(
                employee.resignDate
              ),

            "Creation Date":
              getDateOnly(
                employee.creationDate
              ),

            // =================================================
            // BANK DETAILS
            // =================================================

            "Bank A/C No":
              bankDetail?.bankAcNo || "",

            "IFSC Code":
              bankDetail?.ifscCode || "",

            "PF Number":
              bankDetail?.pfNumber || "",

            "PF Membership Date":
              getDateOnly(
                bankDetail?.pfMembershipDate
              ),

            "ESI Number":
              bankDetail?.esiNumber || "",

            "ESI Membership Date":
              getDateOnly(
                bankDetail?.esiMembershipDate
              ),

            "PAN No":
              bankDetail?.panNo || "",

            "PF Applicable":
              bankDetail
                ? Boolean(
                    bankDetail.pfApplicable
                  )
                    ? "Yes"
                    : "No"
                : "",

            "ESI Applicable":
              bankDetail
                ? Boolean(
                    bankDetail.esiApplicable
                  )
                    ? "Yes"
                    : "No"
                : "",

            "Bonus Applicable":
              bankDetail
                ? Boolean(
                    bankDetail.bonusApplicable
                  )
                    ? "Yes"
                    : "No"
                : "",

            FPF:
              bankDetail
                ? Boolean(
                    bankDetail.fpf
                  )
                    ? "Yes"
                    : "No"
                : "",

            // =================================================
            // QUALIFICATION
            // =================================================

            "Qualification Code":
              qualification.code || "",

            Qualification:
              qualification.qualification ||
              "",

            Institution:
              qualification.institution ||
              "",

            "From Year":
              qualification.fromYear || "",

            "To Year":
              qualification.toYear || "",

            University:
              qualification.university ||
              "",

            Division:
              qualification.division || "",

            "%age of Marks":
              qualification.marksPercentage ||
              "",
          });
        }
      );
    }

    return finalExcelData;
  };

  // =====================================================
  // EXCEL REPORT
  // =====================================================

  const handleExcelReport = async () => {
    setError("");
    setMessage("");

    // Current filters ke according
    // employees dobara filter honge.
    const filteredEmployees =
      getFilteredEmployees();

    if (filteredEmployees.length === 0) {
      setError(
        "No employee data found for selected filters."
      );
      return;
    }

    try {
      setLoading(true);

      setMessage(
        "Preparing complete employee report..."
      );

      // Employee + Bank + Qualification
      const excelData =
        await createExcelData(
          filteredEmployees
        );

      if (!excelData.length) {
        setError(
          "No employee data available for Excel report."
        );
        return;
      }

      // =================================================
      // CREATE WORKSHEET
      // =================================================

      const worksheet =
        XLSX.utils.json_to_sheet(
          excelData
        );

      // =================================================
      // COLUMN WIDTH
      // =================================================

      worksheet["!cols"] = [
        // Employee Details
        { wch: 14 }, // Unit Code
        { wch: 15 }, // Employee ID
        { wch: 25 }, // Employee Name
        { wch: 25 }, // Father Name
        { wch: 14 }, // DOB
        { wch: 16 }, // Aadhaar
        { wch: 16 }, // Contact
        { wch: 28 }, // Mail
        { wch: 18 }, // Department
        { wch: 18 }, // Contractor
        { wch: 18 }, // Shift
        { wch: 20 }, // Designation
        { wch: 18 }, // Category
        { wch: 22 }, // Reporting Person
        { wch: 16 }, // Joining Date
        { wch: 16 }, // Resign Date
        { wch: 16 }, // Creation Date

        // Bank Details
        { wch: 18 }, // Bank A/C
        { wch: 16 }, // IFSC
        { wch: 16 }, // PF
        { wch: 20 }, // PF Membership
        { wch: 16 }, // ESI
        { wch: 20 }, // ESI Membership
        { wch: 16 }, // PAN
        { wch: 16 }, // PF Applicable
        { wch: 16 }, // ESI Applicable
        { wch: 18 }, // Bonus
        { wch: 12 }, // FPF

        // Qualification
        { wch: 18 }, // Code
        { wch: 22 }, // Qualification
        { wch: 25 }, // Institution
        { wch: 14 }, // From
        { wch: 14 }, // To
        { wch: 25 }, // University
        { wch: 18 }, // Division
        { wch: 18 }, // Marks
      ];

      // =================================================
      // CREATE WORKBOOK
      // =================================================

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Employee Complete Report"
      );

      // =================================================
      // FILE NAME
      // =================================================

      let fileName =
        "Employee_Complete_Report";

      if (employeeId !== "All") {
        fileName +=
          `_Employee-${employeeId}`;
      }

      if (department !== "All") {
        fileName +=
          `_Department-${department}`;
      }

      if (designation !== "All") {
        fileName +=
          `_Designation-${designation}`;
      }

      if (category !== "All") {
        fileName +=
          `_Category-${category}`;
      }

      if (fromDate) {
        fileName +=
          `_From-${fromDate}`;
      }

      if (toDate) {
        fileName +=
          `_To-${toDate}`;
      }

      fileName += ".xlsx";

      // =================================================
      // DOWNLOAD
      // =================================================

      XLSX.writeFile(
        workbook,
        fileName
      );

      setReportData(
        filteredEmployees
      );

      setMessage(
        `${excelData.length} report row(s) downloaded successfully. Employee, Bank Detail and Qualification columns included.`
      );
    } catch (err) {
      console.error(
        "Excel Report Error:",
        err
      );

      setError(
        "Failed to generate Excel report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-report-page">

      {/* PAGE TITLE */}

      <h2 className="employee-report-title">
        Employee Detail Report
      </h2>

      {/* PARAMETER BOX */}

      <div className="report-parameter-box">

        <div className="report-parameter-heading">
          Enter Value For The Parameter
        </div>

        {/* Employee ID */}

        <div className="report-row">

          <label>
            Employee ID
          </label>

          <select
            value={employeeId}
            onChange={(e) =>
              setEmployeeId(
                e.target.value
              )
            }
          >

            <option value="All">
              All
            </option>

            {employeeIds.map(
              (id) => (
                <option
                  key={id}
                  value={id}
                >
                  {id}
                </option>
              )
            )}

          </select>

        </div>

        {/* Department */}

        <div className="report-row">

          <label>
            Department
          </label>

          <select
            value={department}
            onChange={(e) =>
              setDepartment(
                e.target.value
              )
            }
          >

            <option value="All">
              All
            </option>

            {departments.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

        </div>

        {/* Designation */}

        <div className="report-row">

          <label>
            Designation
          </label>

          <select
            value={designation}
            onChange={(e) =>
              setDesignation(
                e.target.value
              )
            }
          >

            <option value="All">
              All
            </option>

            {designations.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

        </div>

        {/* Category */}

        <div className="report-row">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >

            <option value="All">
              All
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

        </div>

        {/* FROM DATE */}

        <div className="report-row">

          <label>
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
          />

        </div>

        {/* TO DATE */}

        <div className="report-row">

          <label>
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
          />

        </div>

        {/* BUTTONS */}

        <div className="report-buttons">

          <button
            type="button"
            className="report-btn fetch-btn"
            onClick={
              handleFetchReport
            }
            disabled={loading}
          >

            <Search size={16} />

            Fetch Report

          </button>

          <button
            type="button"
            className="report-btn excel-btn"
            onClick={
              handleExcelReport
            }
            disabled={loading}
          >

            <FileSpreadsheet
              size={16}
            />

            {loading
              ? "Preparing..."
              : "Excel Report"}

          </button>

          <button
            type="button"
            className="report-btn clear-btn"
            onClick={
              handleClear
            }
            disabled={loading}
          >

            <RotateCcw
              size={16}
            />

            Clear

          </button>

        </div>

      </div>

      {/* MESSAGE */}

      {loading && (
        <div className="report-message">
          Preparing Employee + Bank +
          Qualification Excel report...
        </div>
      )}

      {message && (
        <div className="report-success">
          {message}
        </div>
      )}

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {/* REPORT TABLE */}

      {reportData.length > 0 && (
        <div className="report-result-section">

          <div className="report-result-header">

            <h3>
              Employee Detail Report
            </h3>

            <button
              type="button"
              className="bottom-excel-btn"
              onClick={
                handleExcelReport
              }
              disabled={loading}
            >

              <Download
                size={17}
              />

              {loading
                ? "Preparing..."
                : "Download Complete Excel Report"}

            </button>

          </div>

          <div className="report-table-wrapper">

            <table className="report-table">

              <thead>

                <tr>
                  <th>S.No</th>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Father Name</th>
                  <th>DOB</th>
                  <th>Aadhaar</th>
                  <th>Contact No</th>
                  <th>Mail ID</th>
                  <th>Department</th>
                  <th>Contractor</th>
                  <th>Shift</th>
                  <th>Designation</th>
                  <th>Category</th>
                  <th>Reporting Person</th>
                  <th>Joining Date</th>
                  <th>Resign Date</th>
                  <th>Creation Date</th>
                </tr>

              </thead>

              <tbody>

                {reportData.map(
                  (employee, index) => (
                    <tr
                      key={
                        employee._id ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {employee.employeeCode ||
                          "-"}
                      </td>

                      <td>
                        {employee.employeeName ||
                          "-"}
                      </td>

                      <td>
                        {employee.fatherName ||
                          "-"}
                      </td>

                      <td>
                        {getDateOnly(
                          employee.dob
                        ) || "-"}
                      </td>

                      <td>
                        {employee.aadhar ||
                          "-"}
                      </td>

                      <td>
                        {employee.contactNo ||
                          "-"}
                      </td>

                      <td>
                        {employee.mailId ||
                          "-"}
                      </td>

                      <td>
                        {employee.departmentCode ||
                          "-"}
                      </td>

                      <td>
                        {employee.contractorCode ||
                          "-"}
                      </td>

                      <td>
                        {employee.assignedShift ||
                          "-"}
                      </td>

                      <td>
                        {employee.designation ||
                          "-"}
                      </td>

                      <td>
                        {employee.category ||
                          "-"}
                      </td>

                      <td>
                        {employee.reportingPerson ||
                          "-"}
                      </td>

                      <td>
                        {getDateOnly(
                          employee.joiningDate
                        ) || "-"}
                      </td>

                      <td>
                        {getDateOnly(
                          employee.resignDate
                        ) || "-"}
                      </td>

                      <td>
                        {getDateOnly(
                          employee.creationDate
                        ) || "-"}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* BACK TO EMPLOYEE INFORMATION */}

      <div className="report-back-section">

        <button
          type="button"
          className="report-back-btn"
          onClick={
            onEmployeeInformation
          }
        >
          Employee Information
        </button>

      </div>

    </div>
  );
}

export default EmployeeReport;