
const express = require("express");
const router = express.Router();

const multer = require("multer");
const XLSX = require("xlsx");

const Employee = require("../models/Employee");

// =====================================================
// MULTER
// File memory mein rahegi
// =====================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".xlsx",
      ".xls",
      ".csv",
    ];

    const fileName =
      file.originalname.toLowerCase();

    const isAllowed =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!isAllowed) {
      return cb(
        new Error(
          "Only .xlsx, .xls and .csv files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

// =====================================================
// HEADER NORMALIZATION
// Example:
// "Employee Code" -> "employeecode"
// "Employee_Name" -> "employeename"
// "employee-code" -> "employeecode"
// =====================================================

const normalizeHeader = (header) => {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

// =====================================================
// HEADER MAPPING
// Excel/CSV HEADER -> DATABASE FIELD
// =====================================================

const headerMap = {
  // Unit
  unitcode: "unitCode",
  unit: "unitCode",

  // Employee
  employeecode: "employeeCode",
  employeeid: "employeeCode",
  empcode: "employeeCode",

  employeename: "employeeName",
  employeename: "employeeName",
  name: "employeeName",

  // Father
  fathername: "fatherName",
  father: "fatherName",

  // DOB
  dob: "dob",
  dateofbirth: "dob",
  birthdate: "dob",

  // Aadhaar
  aadhar: "aadhar",
  aadhaar: "aadhar",
  aadharno: "aadhar",
  aadhaarno: "aadhar",

  // Contact
  contactno: "contactNo",
  contactnumber: "contactNo",
  mobilenumber: "contactNo",
  mobile: "contactNo",
  phone: "contactNo",

  // Email
  mailid: "mailId",
  email: "mailId",
  emailid: "mailId",

  // Department
  department: "departmentCode",
  departmentcode: "departmentCode",
  dept: "departmentCode",
  deptcode: "departmentCode",

  // Contractor
  contractor: "contractorCode",
  contractorcode: "contractorCode",
  contractorid: "contractorCode",

  // Shift
  shift: "assignedShift",
  assignedshift: "assignedShift",

  // Designation
  designation: "designation",
  designationcode: "designation",

  // Category
  category: "category",

  // Reporting Person
  reportingperson: "reportingPerson",
  reportingmanager: "reportingPerson",
  manager: "reportingPerson",

  // Salary
  basicsalary: "basicSalary",
  salary: "basicSalary",

  // PF
  pfapplicable: "pfApplicable",
  pfnumber: "pfNumber",
  pfno: "pfNumber",

  // ESI
  esiapplicable: "esiApplicable",
  esinumber: "esiNumber",
  esino: "esiNumber",

  // Effective Date
  effectivedate: "effectiveDate",
};

// =====================================================
// BOOLEAN CONVERTER
// =====================================================

const convertBoolean = (value) => {
  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  const text =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    text === "yes" ||
    text === "y" ||
    text === "true" ||
    text === "1"
  ) {
    return true;
  }

  if (
    text === "no" ||
    text === "n" ||
    text === "false" ||
    text === "0"
  ) {
    return false;
  }

  return false;
};

// =====================================================
// DATE CONVERTER
// =====================================================

const convertDate = (value) => {
  if (!value) {
    return null;
  }

  // Excel date number
  if (typeof value === "number") {
    const excelDate =
      XLSX.SSF.parse_date_code(value);

    if (!excelDate) {
      return null;
    }

    return new Date(
      excelDate.y,
      excelDate.m - 1,
      excelDate.d
    );
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate;
};

// =====================================================
// NUMBER CONVERTER
// =====================================================

const convertNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const number =
    Number(
      String(value).replace(
        /,/g,
        ""
      )
    );

  return Number.isNaN(number)
    ? 0
    : number;
};

// =====================================================
// POST
// /api/excel-upload
// =====================================================

router.post(
  "/",
  upload.single("file"),
  async (req, res) => {
    try {
      // =============================================
      // FILE CHECK
      // =============================================

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select an Excel or CSV file.",
        });
      }

      // =============================================
      // READ EXCEL / CSV
      // =============================================

      const workbook =
        XLSX.read(
          req.file.buffer,
          {
            type: "buffer",
            cellDates: true,
          }
        );

      if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
      ) {
        return res.status(400).json({
          message:
            "No worksheet found in the uploaded file.",
        });
      }

      // First sheet
      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      // Convert sheet into JSON
      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
            raw: true,
          }
        );

      if (rows.length === 0) {
        return res.status(400).json({
          message:
            "The uploaded file is empty.",
        });
      }

      // =============================================
      // READ ORIGINAL HEADERS
      // =============================================

      const originalHeaders =
        Object.keys(rows[0]);

      // =============================================
      // CREATE NORMALIZED HEADER MAP
      // =============================================

      const normalizedHeaders =
        {};

      originalHeaders.forEach(
        (header) => {
          normalizedHeaders[header] =
            normalizeHeader(header);
        }
      );

      // =============================================
      // COUNTERS
      // =============================================

      let savedRecords = 0;
      let skippedRecords = 0;

      const skippedRows = [];

      // =============================================
      // PROCESS EACH ROW
      // =============================================

      for (
        let rowIndex = 0;
        rowIndex < rows.length;
        rowIndex++
      ) {
        const row =
          rows[rowIndex];

        try {
          const employeeData = {};

          const extraExcelData = {};

          // =========================================
          // HEADER-BASED MAPPING
          // =========================================

          Object.keys(row).forEach(
            (originalHeader) => {
              const value =
                row[originalHeader];

              const normalizedHeader =
                normalizeHeader(
                  originalHeader
                );

              const databaseField =
                headerMap[
                  normalizedHeader
                ];

              // ---------------------------------------
              // KNOWN FIELD
              // ---------------------------------------

              if (databaseField) {
                employeeData[
                  databaseField
                ] = value;
              }

              // ---------------------------------------
              // UNKNOWN / NEW COLUMN
              // Preserve it
              // ---------------------------------------

              else if (
                originalHeader.trim()
              ) {
                extraExcelData[
                  originalHeader
                ] = value;
              }
            }
          );

          // =========================================
          // REQUIRED VALIDATION
          // =========================================

          const employeeCode =
            String(
              employeeData.employeeCode ||
                ""
            ).trim();

          const employeeName =
            String(
              employeeData.employeeName ||
                ""
            ).trim();

          if (!employeeCode) {
            skippedRecords++;

            skippedRows.push({
              row: rowIndex + 2,
              reason:
                "Employee Code is missing.",
            });

            continue;
          }

          if (!employeeName) {
            skippedRecords++;

            skippedRows.push({
              row: rowIndex + 2,
              reason:
                "Employee Name is missing.",
            });

            continue;
          }

          // =========================================
          // CLEAN STRING FIELDS
          // =========================================

          const stringFields = [
            "unitCode",
            "employeeCode",
            "employeeName",
            "fatherName",
            "aadhar",
            "contactNo",
            "mailId",
            "departmentCode",
            "contractorCode",
            "assignedShift",
            "designation",
            "category",
            "reportingPerson",
            "pfNumber",
            "esiNumber",
          ];

          stringFields.forEach(
            (field) => {
              if (
                employeeData[field] !==
                undefined
              ) {
                employeeData[field] =
                  String(
                    employeeData[field]
                  ).trim();
              }
            }
          );

          // =========================================
          // BASIC SALARY
          // =========================================

          if (
            employeeData.basicSalary !==
            undefined
          ) {
            employeeData.basicSalary =
              convertNumber(
                employeeData.basicSalary
              );
          }

          // =========================================
          // PF APPLICABLE
          // =========================================

          if (
            employeeData.pfApplicable !==
            undefined
          ) {
            employeeData.pfApplicable =
              convertBoolean(
                employeeData.pfApplicable
              );
          }

          // =========================================
          // ESI APPLICABLE
          // =========================================

          if (
            employeeData.esiApplicable !==
            undefined
          ) {
            employeeData.esiApplicable =
              convertBoolean(
                employeeData.esiApplicable
              );
          }

          // =========================================
          // DOB
          // =========================================

          if (
            employeeData.dob !==
            undefined
          ) {
            employeeData.dob =
              convertDate(
                employeeData.dob
              );
          }

          // =========================================
          // EFFECTIVE DATE
          // =========================================

          if (
            employeeData.effectiveDate !==
            undefined
          ) {
            employeeData.effectiveDate =
              convertDate(
                employeeData.effectiveDate
              );
          }

          // =========================================
          // PRESERVE EXTRA COLUMNS
          // =========================================

          if (
            Object.keys(
              extraExcelData
            ).length > 0
          ) {
            employeeData.excelData =
              extraExcelData;
          }

          // =========================================
          // CHECK DUPLICATE EMPLOYEE
          // =========================================

          const existingEmployee =
            await Employee.findOne({
              employeeCode,
            });

          if (existingEmployee) {
            // Update existing employee
            Object.keys(
              employeeData
            ).forEach((field) => {
              if (
                field !==
                "employeeCode"
              ) {
                existingEmployee[field] =
                  employeeData[field];
              }
            });

            await existingEmployee.save();

            savedRecords++;
          } else {
            // Create new employee
            const newEmployee =
              new Employee(
                employeeData
              );

            await newEmployee.save();

            savedRecords++;
          }
        } catch (rowError) {
          console.error(
            `Row ${
              rowIndex + 2
            } error:`,
            rowError.message
          );

          skippedRecords++;

          skippedRows.push({
            row: rowIndex + 2,
            reason:
              rowError.message,
          });
        }
      }

      // =============================================
      // RESPONSE
      // =============================================

      return res.status(200).json({
        message:
          "Employee Excel/CSV uploaded successfully.",

        fileName:
          req.file.originalname,

        totalRecords:
          rows.length,

        savedRecords,

        skippedRecords,

        skippedRows,
      });
    } catch (error) {
      console.error(
        "Excel/CSV upload error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to process Excel/CSV file.",
      });
    }
  }
);

// =====================================================
// MULTER / FILE ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        message:
          "File upload error: " +
          error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message:
          error.message ||
          "File upload failed.",
      });
    }

    next();
  }
);

module.exports = router;

