
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const Attendance = require("../models/attendence");

const router = express.Router();

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  dest: "uploads/",
});


// =====================================================
// HELPERS
// =====================================================

// Column name ko compare karne ke liye normalize
function normalizeColumnName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


// Possible column names
function findColumn(row, possibleNames) {
  const keys = Object.keys(row);

  for (const possibleName of possibleNames) {
    const normalizedPossible =
      normalizeColumnName(possibleName);

    const foundKey = keys.find(
      (key) =>
        normalizeColumnName(key) ===
        normalizedPossible
    );

    if (foundKey) {
      return foundKey;
    }
  }

  return null;
}


// =====================================================
// DATE FORMAT
// DD-MM-YYYY
// =====================================================

function formatDate(value) {
  if (!value) {
    return "";
  }

  // Excel serial date
  if (typeof value === "number") {
    const date =
      XLSX.SSF.parse_date_code(value);

    if (date) {
      const day = String(date.d).padStart(2, "0");
      const month = String(date.m).padStart(2, "0");
      const year = date.y;

      return `${day}-${month}-${year}`;
    }
  }

  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return String(value);
}


// =====================================================
// TIME FORMAT
// hh:mm AM/PM
// =====================================================

function formatTime(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  // Excel time value
  if (typeof value === "number") {
    const totalMinutes = Math.round(
      value * 24 * 60
    );

    let hours =
      Math.floor(totalMinutes / 60) % 24;

    const minutes =
      totalMinutes % 60;

    const period =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )} ${period}`;
  }

  const text = String(value).trim();

  // Already AM/PM
  const ampmMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i
  );

  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const period =
      ampmMatch[3].toUpperCase();

    return `${String(hours).padStart(
      2,
      "0"
    )}:${minutes} ${period}`;
  }

  // HH:mm or HH:mm:ss
  const timeMatch = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/
  );

  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = timeMatch[2];

    const period =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}:${minutes} ${period}`;
  }

  return text;
}


// =====================================================
// GET ATTENDANCE
// =====================================================

router.get("/", async (req, res) => {
  try {
    const {
      department,
      shift,
      employeeCode,
      attendanceDate,
    } = req.query;

    const filter = {};

    if (department) {
      filter.department = department.trim();
    }

    if (shift) {
      filter.shift = shift.trim();
    }

    if (employeeCode) {
      filter.employeeCode =
        employeeCode.trim();
    }

    const records =
      await Attendance.find(filter).sort({
        createdAt: -1,
      });

    // Date filtering formatted date ke basis par
    let result = records;

    if (attendanceDate) {
      const formattedSearchDate =
        formatDate(attendanceDate);

      result = records.filter(
        (record) =>
          formatDate(
            record.attendanceDate
          ) === formattedSearchDate
      );
    }

    res.json(result);

  } catch (error) {
    console.error(
      "Fetch attendance error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch attendance",
      error: error.message,
    });
  }
});


// =====================================================
// DYNAMIC EXCEL UPLOAD
// =====================================================

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload an Excel file",
        });
      }

      // Read workbook
      const workbook =
        XLSX.readFile(req.file.path, {
          cellDates: true,
        });

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[sheetName];

      // Excel -> JSON
      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: "",
            raw: true,
          }
        );

      if (rows.length === 0) {
        return res.status(400).json({
          message:
            "Excel file is empty",
        });
      }


      // =================================================
      // IDENTIFY IMPORTANT COLUMNS
      // =================================================

      const firstRow = rows[0];

      const employeeCodeColumn =
        findColumn(firstRow, [
          "Employee Code",
          "EmployeeCode",
          "Emp Code",
          "EmpCode",
          "Employee ID",
          "EmployeeId",
          "Emp ID",
          "EmpId",
        ]);

      const employeeNameColumn =
        findColumn(firstRow, [
          "Employee Name",
          "EmployeeName",
          "Emp Name",
          "EmpName",
          "Name",
        ]);

      const departmentColumn =
        findColumn(firstRow, [
          "Department",
          "Department Name",
          "Dept",
          "Dept Name",
        ]);

      const shiftColumn =
        findColumn(firstRow, [
          "Shift",
          "Shift Name",
        ]);

      const dateColumn =
        findColumn(firstRow, [
          "Attendance Date",
          "AttendanceDate",
          "Date",
          "Att Date",
          "Punch Date",
        ]);

      const inTimeColumn =
        findColumn(firstRow, [
          "In Time",
          "InTime",
          "IN Time",
          "Punch In",
          "PunchIn",
          "Check In",
          "CheckIn",
        ]);

      const outTimeColumn =
        findColumn(firstRow, [
          "Out Time",
          "OutTime",
          "OUT Time",
          "Punch Out",
          "PunchOut",
          "Check Out",
          "CheckOut",
        ]);


      // =================================================
      // CREATE RECORDS
      // =================================================

      const attendanceRecords = [];

      for (const row of rows) {

        // -----------------------------------------------
        // All Excel columns preserve
        // -----------------------------------------------

        const excelData = {};

        Object.keys(row).forEach(
          (columnName) => {
            excelData[columnName] =
              row[columnName];
          }
        );


        // -----------------------------------------------
        // Important values
        // -----------------------------------------------

        const employeeCode =
          employeeCodeColumn
            ? String(
                row[
                  employeeCodeColumn
                ] || ""
              ).trim()
            : "";

        const employeeName =
          employeeNameColumn
            ? String(
                row[
                  employeeNameColumn
                ] || ""
              ).trim()
            : "";

        const department =
          departmentColumn
            ? String(
                row[
                  departmentColumn
                ] || ""
              ).trim()
            : "";

        const shift =
          shiftColumn
            ? String(
                row[shiftColumn] || ""
              ).trim()
            : "";

        const rawDate =
          dateColumn
            ? row[dateColumn]
            : "";

        const rawInTime =
          inTimeColumn
            ? row[inTimeColumn]
            : "";

        const rawOutTime =
          outTimeColumn
            ? row[outTimeColumn]
            : "";


        // -----------------------------------------------
        // Format Date
        // -----------------------------------------------

        const formattedDate =
          formatDate(rawDate);


        // -----------------------------------------------
        // Format Time
        // -----------------------------------------------

        const formattedInTime =
          formatTime(rawInTime);

        const formattedOutTime =
          formatTime(rawOutTime);


        // -----------------------------------------------
        // Automatic P / A
        // -----------------------------------------------

        const status =
          formattedInTime !== ""
            ? "P"
            : "A";


        // -----------------------------------------------
        // Skip completely empty row
        // -----------------------------------------------

        const hasAnyData =
          Object.values(row).some(
            (value) =>
              value !== "" &&
              value !== null &&
              value !== undefined
          );

        if (!hasAnyData) {
          continue;
        }


        // -----------------------------------------------
        // Save record
        // -----------------------------------------------

        attendanceRecords.push({
          attendanceDate:
            rawDate || new Date(),

          employeeCode,

          employeeName,

          department,

          shift,

          inTime:
            formattedInTime,

          outTime:
            formattedOutTime,

          status,

          excelData,
        });
      }


      if (
        attendanceRecords.length === 0
      ) {
        return res.status(400).json({
          message:
            "No valid records found",
        });
      }


      // =================================================
      // SAVE TO MONGODB
      // =================================================

      const savedRecords =
        await Attendance.insertMany(
          attendanceRecords
        );


      res.status(201).json({
        message:
          "Attendance Excel uploaded successfully",

        totalRecords:
          savedRecords.length,

        totalColumns:
          Object.keys(firstRow).length,

        columns:
          Object.keys(firstRow),

        records:
          savedRecords,
      });

    } catch (error) {

      console.error(
        "Excel upload error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to upload Excel",

        error:
          error.message,
      });
    }
  }
);


// =====================================================
// ADD SINGLE ATTENDANCE
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      attendanceDate,
      employeeCode,
      employeeName,
      department,
      shift,
      inTime,
      outTime,
      ...extraData
    } = req.body;


    const status =
      inTime &&
      String(inTime).trim() !== ""
        ? "P"
        : "A";


    const attendance =
      new Attendance({
        attendanceDate:
          attendanceDate || new Date(),

        employeeCode,

        employeeName,

        department,

        shift,

        inTime:
          formatTime(inTime),

        outTime:
          formatTime(outTime),

        status,

        excelData:
          extraData,
      });


    const savedRecord =
      await attendance.save();


    res.status(201).json(
      savedRecord
    );

  } catch (error) {

    console.error(
      "Add attendance error:",
      error
    );

    res.status(400).json({
      message:
        "Failed to save attendance",

      error:
        error.message,
    });
  }
});


// =====================================================
// DELETE ATTENDANCE
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedRecord =
      await Attendance.findByIdAndDelete(
        req.params.id
      );

    if (!deletedRecord) {
      return res.status(404).json({
        message:
          "Attendance record not found",
      });
    }

    res.json({
      message:
        "Attendance record deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete attendance error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete attendance",
      error:
        error.message,
    });
  }
});


module.exports = router;

