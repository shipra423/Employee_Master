const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");

const Employee = require("../models/Employee");

const router = express.Router();

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),
});

// =====================================================
// NORMALIZE HEADER
// =====================================================

const normalizeHeader = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_\-./]+/g, "");
};

// =====================================================
// FIND HEADER ROW AUTOMATICALLY
// =====================================================

const findHeaderRow = (sheet) => {
  const rawRows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i] || [];

    const normalizedRow = row.map(normalizeHeader);

    const hasEmployeeNumber = normalizedRow.some((x) =>
      [
        "empnumber",
        "employeenumber",
        "employeeid",
        "empid",
        "employeecode",
        "empcode",
        "employeenocode",
      ].includes(x)
    );

    const hasEmployeeName = normalizedRow.some((x) =>
      [
        "empname",
        "employeename",
        "name",
      ].includes(x)
    );

    if (hasEmployeeNumber && hasEmployeeName) {
      return i;
    }
  }

  return -1;
};

// =====================================================
// GET VALUE FROM ROW USING ALIASES
// =====================================================

const getValue = (row, aliases) => {
  const keys = Object.keys(row);

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);

    const foundKey = keys.find(
      (key) =>
        normalizeHeader(key) === normalizedAlias
    );

    if (foundKey !== undefined) {
      const value = row[foundKey];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return String(value).trim();
      }
    }
  }

  return "";
};

// =====================================================
// DATE CONVERTER
// =====================================================

const convertExcelDate = (value) => {
  if (!value) {
    return null;
  }

  // Already Date
  if (value instanceof Date) {
    return value;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  // DD-MMM-YY
  // Example: 30-DEC-19

  const match = text.match(
    /^(\d{1,2})[-/ ]([A-Za-z]{3,})[-/ ](\d{2,4})$/
  );

  if (match) {
    const day = Number(match[1]);
    const monthText = match[2]
      .substring(0, 3)
      .toLowerCase();

    let year = Number(match[3]);

    if (year < 100) {
      year += year >= 50 ? 1900 : 2000;
    }

    const months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    if (
      months[monthText] !== undefined
    ) {
      return new Date(
        year,
        months[monthText],
        day
      );
    }
  }

  // Normal date
  const parsed = new Date(text);

  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
};

// =====================================================
// POST /api/excel-upload
// =====================================================

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      console.log(
        "\n========================================"
      );

      console.log(
        "EMPLOYEE EXCEL UPLOAD STARTED"
      );

      console.log(
        "========================================"
      );

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select an Excel or CSV file.",
        });
      }

      console.log(
        "FILE:",
        req.file.originalname
      );

      // =================================================
      // READ EXCEL / CSV
      // =================================================

      const workbook = XLSX.read(
        req.file.buffer,
        {
          type: "buffer",
          cellDates: true,
          raw: false,
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      if (!sheetName) {
        return res.status(400).json({
          message:
            "Excel file does not contain any sheet.",
        });
      }

      const worksheet =
        workbook.Sheets[sheetName];

      // =================================================
      // FIND ACTUAL HEADER ROW
      // =================================================

      const headerRowIndex =
        findHeaderRow(worksheet);

      console.log(
        "HEADER ROW INDEX:",
        headerRowIndex
      );

      if (headerRowIndex === -1) {
        return res.status(400).json({
          message:
            "Employee columns could not be detected. Employee Number / Employee Name column not found.",
        });
      }

      // =================================================
      // CONVERT USING DETECTED HEADER
      // =================================================

      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            range: headerRowIndex,
            defval: "",
            raw: false,
          }
        );

      console.log(
        "TOTAL EXCEL ROWS:",
        rows.length
      );

      if (!rows.length) {
        return res.status(400).json({
          message:
            "Excel file does not contain employee records.",
        });
      }

      // =================================================
      // PREPARE RESPONSE DATA
      // =================================================

      const uploadedRows = [];

      let savedRecords = 0;
      let skippedRecords = 0;

      // =================================================
      // PROCESS EVERY ROW
      // =================================================

      for (
        let index = 0;
        index < rows.length;
        index++
      ) {
        const row = rows[index];

        const excelRowNumber =
          headerRowIndex +
          index +
          2;

        console.log(
          `\nPROCESSING EXCEL ROW ${excelRowNumber}`
        );

        try {
          // =================================================
          // EMPLOYEE NUMBER
          // =================================================

          const employeeCode =
            getValue(row, [
              "Employee Number",
              "Emp Number",
              "Employee No",
              "Emp No",
              "Employee ID",
              "Emp ID",
              "Employee Code",
              "Emp Code",
              "employeeNumber",
              "employeeCode",
              "empId",
              "empCode",
            ]);

          console.log(
            "Employee Number:",
            employeeCode
          );

          // =================================================
          // EMPLOYEE NAME
          // =================================================

          const employeeName =
            getValue(row, [
              "Employee Name",
              "Emp Name",
              "Employee",
              "Emp",
              "Name",
            ]);

          // =================================================
          // DEPARTMENT
          // =================================================

          const departmentCode =
            getValue(row, [
              "Department",
              "Departmen",
              "Department Code",
              "Dept",
              "Dept Code",
            ]);

          // =================================================
          // SKIP ONLY IF EMPLOYEE ID / NAME MISSING
          // =================================================

          if (!employeeCode) {
            console.log(
              `ROW ${excelRowNumber} SKIPPED: Employee Number missing`
            );

            skippedRecords++;

            uploadedRows.push({
              ...row,
              __status: "Skipped",
              __reason:
                "Employee Number missing",
            });

            continue;
          }

          if (!employeeName) {
            console.log(
              `ROW ${excelRowNumber} SKIPPED: Employee Name missing`
            );

            skippedRecords++;

            uploadedRows.push({
              ...row,
              __status: "Skipped",
              __reason:
                "Employee Name missing",
            });

            continue;
          }

          // =================================================
          // DUPLICATE CHECK
          // =================================================

          const existingEmployee =
            await Employee.findOne({
              employeeCode,
            });

          if (existingEmployee) {
            console.log(
              `ROW ${excelRowNumber} SKIPPED: Employee already exists`
            );

            skippedRecords++;

            uploadedRows.push({
              ...row,
              __status: "Skipped",
              __reason:
                "Employee already exists",
            });

            continue;
          }

          // =================================================
          // STANDARD EMPLOYEE MASTER DATA
          // =================================================

          const employeeData = {
            unitCode: getValue(row, [
              "Unit",
              "Unit Code",
              "UnitCode",
            ]),

            employeeCode,

            employeeName,

            fatherName: getValue(row, [
              "Father Name",
              "Father",
              "FatherName",
            ]),

            dob: convertExcelDate(
              getValue(row, [
                "Date Of Birth",
                "Date of Birth",
                "DOB",
                "Birth Date",
              ])
            ),

            aadhar: getValue(row, [
              "Aadhaar",
              "Aadhaar Number",
              "Aadhar",
              "Aadhar Number",
            ]),

            contactNo: getValue(row, [
              "Contact",
              "Contact Number",
              "Mobile",
              "Mobile Number",
              "Phone",
            ]),

            mailId: getValue(row, [
              "Email",
              "Email ID",
              "Mail",
              "Mail ID",
            ]),

            departmentCode,

            contractorCode: getValue(row, [
              "Contractor",
              "Contractor Code",
              "ContractorCode",
            ]),

            assignedShift: getValue(row, [
              "Shift",
              "Assigned Shift",
              "AssignedShift",
            ]),

            designation: getValue(row, [
              "Designation",
              "Designation Name",
            ]),

            category: getValue(row, [
              "Category",
              "Employee Category",
            ]),

            reportingPerson: getValue(
              row,
              [
                "Reporting Person",
                "ReportingPerson",
                "Reporting Manager",
                "Manager",
              ]
            ),

            joiningDate: convertExcelDate(
              getValue(row, [
                "Joining Date",
                "JoiningDate",
                "Date Of Joining",
                "DOJ",
              ])
            ),

            resignDate: convertExcelDate(
              getValue(row, [
                "Resign Date",
                "Resignation Date",
                "Leaving Date",
              ])
            ),

            creationDate:
              convertExcelDate(
                getValue(row, [
                  "Creation Date",
                  "Created Date",
                ])
              ) || new Date(),
          };

          // =================================================
          // SAVE ALL OTHER EXCEL COLUMNS
          // =================================================

          employeeData.excelData = {
            ...row,
          };

          // =================================================
          // SAVE
          // =================================================

          const savedEmployee =
            await Employee.create(
              employeeData
            );

          console.log(
            `ROW ${excelRowNumber} SAVED:`,
            savedEmployee.employeeCode
          );

          savedRecords++;

          uploadedRows.push({
            ...row,
            __status: "Saved",
            __reason: "",
          });
        } catch (rowError) {
          console.error(
            `ROW ${excelRowNumber} ERROR:`,
            rowError.message
          );

          skippedRecords++;

          uploadedRows.push({
            ...row,
            __status: "Skipped",
            __reason:
              rowError.message,
          });
        }
      }

      // =================================================
      // RESPONSE
      // =================================================

      console.log(
        "\n========================================"
      );

      console.log(
        "UPLOAD COMPLETE"
      );

      console.log(
        "TOTAL:",
        rows.length
      );

      console.log(
        "SAVED:",
        savedRecords
      );

      console.log(
        "SKIPPED:",
        skippedRecords
      );

      console.log(
        "========================================\n"
      );

      return res.status(200).json({
        message:
          "Employee Excel uploaded successfully.",

        totalRecords:
          rows.length,

        savedRecords,

        skippedRecords,

        headerRow:
          headerRowIndex + 1,

        columns:
          Object.keys(rows[0] || {}),

        rows: uploadedRows,
      });
    } catch (error) {
      console.error(
        "EMPLOYEE EXCEL UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to upload employee Excel file.",
      });
    }
  }
);

module.exports = router;