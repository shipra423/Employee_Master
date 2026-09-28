const express = require("express");
const router = express.Router();

const Department = require("../models/Department");

// =====================================================
// GET ALL DEPARTMENTS
// GET /api/departments
// =====================================================

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({
      createdAt: -1,
    });

    res.status(200).json(departments);
  } catch (error) {
    console.error(
      "Get departments error:",
      error
    );

    res.status(500).json({
      message: "Failed to load departments.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE DEPARTMENT
// GET /api/departments/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const department =
      await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found.",
      });
    }

    res.status(200).json(department);
  } catch (error) {
    console.error(
      "Get department error:",
      error
    );

    res.status(500).json({
      message: "Failed to load department.",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE DEPARTMENT
// POST /api/departments
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      departmentCode,
      departmentName,
      departmentType,
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !departmentCode ||
      !departmentCode.trim()
    ) {
      return res.status(400).json({
        message: "Department Code is required.",
      });
    }

    if (
      !departmentName ||
      !departmentName.trim()
    ) {
      return res.status(400).json({
        message: "Department Name is required.",
      });
    }

    if (
      !departmentType ||
      !departmentType.trim()
    ) {
      return res.status(400).json({
        message: "Department Type is required.",
      });
    }

    // -----------------------------------------------
    // DUPLICATE CHECK
    // -----------------------------------------------

    const existingDepartment =
      await Department.findOne({
        departmentCode:
          departmentCode.trim(),
      });

    if (existingDepartment) {
      return res.status(400).json({
        message:
          "Department Code already exists.",
      });
    }

    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    const department =
      new Department({
        departmentCode:
          departmentCode.trim(),

        departmentName:
          departmentName.trim(),

        departmentType:
          departmentType.trim(),
      });

    const savedDepartment =
      await department.save();

    res.status(201).json({
      message:
        "Department saved successfully!",

      department:
        savedDepartment,
    });
  } catch (error) {
    console.error(
      "Save department error:",
      error
    );

    // Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Department Code already exists.",
      });
    }

    res.status(500).json({
      message:
        "Failed to save department.",

      error: error.message,
    });
  }
});

// =====================================================
// UPDATE DEPARTMENT
// PUT /api/departments/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      departmentCode,
      departmentName,
      departmentType,
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (
      !departmentCode ||
      !departmentCode.trim()
    ) {
      return res.status(400).json({
        message:
          "Department Code is required.",
      });
    }

    if (
      !departmentName ||
      !departmentName.trim()
    ) {
      return res.status(400).json({
        message:
          "Department Name is required.",
      });
    }

    if (
      !departmentType ||
      !departmentType.trim()
    ) {
      return res.status(400).json({
        message:
          "Department Type is required.",
      });
    }

    // -----------------------------------------------
    // DUPLICATE CHECK
    // Same code kisi aur department ka nahi hona chahiye
    // -----------------------------------------------

    const duplicate =
      await Department.findOne({
        departmentCode:
          departmentCode.trim(),

        _id: {
          $ne: req.params.id,
        },
      });

    if (duplicate) {
      return res.status(400).json({
        message:
          "Department Code already exists.",
      });
    }

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    const updatedDepartment =
      await Department.findByIdAndUpdate(
        req.params.id,

        {
          departmentCode:
            departmentCode.trim(),

          departmentName:
            departmentName.trim(),

          departmentType:
            departmentType.trim(),
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedDepartment) {
      return res.status(404).json({
        message:
          "Department not found.",
      });
    }

    res.status(200).json({
      message:
        "Department updated successfully!",

      department:
        updatedDepartment,
    });
  } catch (error) {
    console.error(
      "Update department error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Department Code already exists.",
      });
    }

    res.status(500).json({
      message:
        "Failed to update department.",

      error: error.message,
    });
  }
});

// =====================================================
// DELETE DEPARTMENT
// DELETE /api/departments/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedDepartment =
      await Department.findByIdAndDelete(
        req.params.id
      );

    if (!deletedDepartment) {
      return res.status(404).json({
        message:
          "Department not found.",
      });
    }

    res.status(200).json({
      message:
        "Department deleted successfully!",
    });
  } catch (error) {
    console.error(
      "Delete department error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete department.",

      error: error.message,
    });
  }
});

module.exports = router;