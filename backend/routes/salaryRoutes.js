
const express = require("express");

const router = express.Router();

const Salary = require("../models/Salary");

// =====================================================
// GET ALL SALARY RECORDS
// GET /api/salary
// =====================================================

router.get("/", async (req, res) => {
  try {
    const records = await Salary.find().sort({
      createdAt: -1,
    });

    res.status(200).json(records);
  } catch (error) {
    console.error(
      "GET SALARY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to fetch salary records.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE SALARY RECORD
// GET /api/salary/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const record =
      await Salary.findById(
        req.params.id
      );

    if (!record) {
      return res.status(404).json({
        message:
          "Salary record not found.",
      });
    }

    res.status(200).json(record);
  } catch (error) {
    console.error(
      "GET SINGLE SALARY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to fetch salary record.",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE SALARY RECORD
// POST /api/salary
// =====================================================

router.post("/", async (req, res) => {
  try {
    console.log(
      "SALARY DATA RECEIVED:",
      req.body
    );

    const {
      employeeCode,
      employeeName,
      department,
      basicSalary,
      pfNumber,
      pfApplicable,
      esiNumber,
      esiApplicable,
      effectiveDate,
    } = req.body;

    // ===============================================
    // REQUIRED VALIDATION
    // ===============================================

    if (
      !employeeCode ||
      !String(employeeCode).trim()
    ) {
      return res.status(400).json({
        message:
          "Employee Code is required.",
      });
    }

    if (
      !employeeName ||
      !String(employeeName).trim()
    ) {
      return res.status(400).json({
        message:
          "Employee Name is required.",
      });
    }

    if (
      !department ||
      !String(department).trim()
    ) {
      return res.status(400).json({
        message:
          "Department is required.",
      });
    }

    // ===============================================
    // CREATE
    // ===============================================

    const salary = new Salary({
      employeeCode:
        String(employeeCode).trim(),

      employeeName:
        String(employeeName).trim(),

      department:
        String(department).trim(),

      basicSalary:
        Number(basicSalary) || 0,

      pfNumber:
        pfNumber
          ? String(pfNumber).trim()
          : "",

      pfApplicable:
        Boolean(pfApplicable),

      esiNumber:
        esiNumber
          ? String(esiNumber).trim()
          : "",

      esiApplicable:
        Boolean(esiApplicable),

      effectiveDate:
        effectiveDate || null,
    });

    const savedSalary =
      await salary.save();

    console.log(
      "SALARY SAVED:",
      savedSalary
    );

    res.status(201).json({
      message:
        "Salary data saved successfully in database.",
      data: savedSalary,
    });
  } catch (error) {
    console.error(
      "POST SALARY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Salary data save failed.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE SALARY RECORD
// PUT /api/salary/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      employeeCode,
      employeeName,
      department,
      basicSalary,
      pfNumber,
      pfApplicable,
      esiNumber,
      esiApplicable,
      effectiveDate,
    } = req.body;

    const updatedSalary =
      await Salary.findByIdAndUpdate(
        req.params.id,
        {
          employeeCode:
            String(
              employeeCode || ""
            ).trim(),

          employeeName:
            String(
              employeeName || ""
            ).trim(),

          department:
            String(
              department || ""
            ).trim(),

          basicSalary:
            Number(basicSalary) || 0,

          pfNumber:
            pfNumber
              ? String(pfNumber).trim()
              : "",

          pfApplicable:
            Boolean(pfApplicable),

          esiNumber:
            esiNumber
              ? String(esiNumber).trim()
              : "",

          esiApplicable:
            Boolean(esiApplicable),

          effectiveDate:
            effectiveDate || null,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedSalary) {
      return res.status(404).json({
        message:
          "Salary record not found.",
      });
    }

    console.log(
      "SALARY UPDATED:",
      updatedSalary
    );

    res.status(200).json({
      message:
        "Salary details updated successfully.",
      data: updatedSalary,
    });
  } catch (error) {
    console.error(
      "PUT SALARY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Salary update failed.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE SALARY RECORD
// DELETE /api/salary/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedSalary =
      await Salary.findByIdAndDelete(
        req.params.id
      );

    if (!deletedSalary) {
      return res.status(404).json({
        message:
          "Salary record not found.",
      });
    }

    console.log(
      "SALARY DELETED:",
      deletedSalary
    );

    res.status(200).json({
      message:
        "Salary record deleted successfully.",
      data: deletedSalary,
    });
  } catch (error) {
    console.error(
      "DELETE SALARY ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Salary deletion failed.",
      error: error.message,
    });
  }
});

module.exports = router;