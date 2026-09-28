
const express = require("express");
const Salary = require("../models/Salary");

const router = express.Router();


// =====================================================
// GET ALL SALARY RECORDS
// =====================================================

router.get("/", async (req, res) => {
  try {
    const records = await Salary.find().sort({
      createdAt: -1,
    });

    res.json(records);

  } catch (error) {

    console.error(
      "Fetch salary error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch salary records",
      error:
        error.message,
    });
  }
});


// =====================================================
// ADD SALARY RECORD
// =====================================================

router.post("/", async (req, res) => {
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


    if (!employeeCode) {
      return res.status(400).json({
        message:
          "Employee Code is required",
      });
    }


    const salary =
      new Salary({

        employeeCode,

        employeeName,

        department,

        basicSalary:
          Number(basicSalary) || 0,

        pfNumber,

        pfApplicable:
          Boolean(pfApplicable),

        esiNumber,

        esiApplicable:
          Boolean(esiApplicable),

        effectiveDate,

      });


    const savedSalary =
      await salary.save();


    res.status(201).json({
      message:
        "Salary details saved successfully",

      record:
        savedSalary,
    });

  } catch (error) {

    console.error(
      "Add salary error:",
      error
    );

    res.status(400).json({
      message:
        "Failed to save salary details",

      error:
        error.message,
    });
  }
});


// =====================================================
// UPDATE SALARY RECORD
// =====================================================

router.put("/:id", async (req, res) => {
  try {

    const updatedSalary =
      await Salary.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedSalary) {
      return res.status(404).json({
        message:
          "Salary record not found",
      });
    }


    res.json({
      message:
        "Salary details updated successfully",

      record:
        updatedSalary,
    });

  } catch (error) {

    console.error(
      "Update salary error:",
      error
    );

    res.status(400).json({
      message:
        "Failed to update salary details",

      error:
        error.message,
    });
  }
});


// =====================================================
// DELETE SALARY RECORD
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
          "Salary record not found",
      });
    }


    res.json({
      message:
        "Salary record deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete salary error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete salary record",

      error:
        error.message,
    });
  }
});


module.exports = router;

