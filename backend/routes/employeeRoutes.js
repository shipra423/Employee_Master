
const express = require("express");
const Employee = require("../models/Employee");

const router = express.Router();

// =====================================================
// GET ALL EMPLOYEES
// =====================================================

router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({
      createdAt: -1,
    });

    res.json(employees);
  } catch (error) {
    console.error("Fetch employees error:", error);

    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
});

// =====================================================
// GET EMPLOYEE BY CODE
// =====================================================

router.get("/code/:employeeCode", async (req, res) => {
  try {
    const employeeCode =
      req.params.employeeCode.trim();

    const employee = await Employee.findOne({
      employeeCode: employeeCode,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json(employee);
  } catch (error) {
    console.error("Find employee error:", error);

    res.status(500).json({
      message: "Failed to find employee",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE FORM 3
//
// Employee Code exists:
//     UPDATE existing employee
//
// Employee Code does not exist:
//     CREATE new employee
// =====================================================

router.post("/form3", async (req, res) => {
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

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!employeeCode || !employeeCode.trim()) {
      return res.status(400).json({
        message: "Employee Code is required.",
      });
    }

    if (!employeeName || !employeeName.trim()) {
      return res.status(400).json({
        message: "Employee Name is required.",
      });
    }

    if (!department || !department.trim()) {
      return res.status(400).json({
        message: "Department is required.",
      });
    }

    // -------------------------------
    // DATA TO SAVE
    // -------------------------------

    const updateData = {
      employeeCode: employeeCode.trim(),

      employeeName: employeeName.trim(),

      departmentCode: department.trim(),

      basicSalary:
        Number(basicSalary) || 0,

      pfNumber:
        pfNumber
          ? pfNumber.trim()
          : "",

      pfApplicable:
        Boolean(pfApplicable),

      esiNumber:
        esiNumber
          ? esiNumber.trim()
          : "",

      esiApplicable:
        Boolean(esiApplicable),

      effectiveDate:
        effectiveDate
          ? new Date(effectiveDate)
          : null,
    };

    // -------------------------------
    // FIND + UPDATE / CREATE
    // -------------------------------

    const employee =
      await Employee.findOneAndUpdate(
        {
          employeeCode:
            employeeCode.trim(),
        },
        {
          $set: updateData,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    console.log(
      "FORM 3 SAVED:",
      employee
    );

    res.status(200).json({
      message:
        "Employee PF / ESI details saved successfully.",
      employee: employee,
    });
  } catch (error) {
    console.error(
      "Form 3 save error:",
      error
    );

    res.status(400).json({
      message:
        "Failed to save employee details.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE EMPLOYEE BY ID
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const updatedEmployee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error(
      "Update employee error:",
      error
    );

    res.status(400).json({
      message:
        "Failed to update employee",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE EMPLOYEE
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedEmployee =
      await Employee.findByIdAndDelete(
        req.params.id
      );

    if (!deletedEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json({
      message:
        "Employee deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete employee error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete employee",
      error: error.message,
    });
  }
});

module.exports = router;

