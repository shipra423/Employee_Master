const express = require("express");
const router = express.Router();

const Designation = require("../models/Designation");

// =====================================================
// GET ALL DESIGNATIONS
// GET /api/designations
// =====================================================

router.get("/", async (req, res) => {
  try {
    const designations = await Designation.find().sort({
      createdAt: -1,
    });

    res.status(200).json(designations);
  } catch (error) {
    console.error("Get designations error:", error);

    res.status(500).json({
      message: "Failed to load designation data.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE DESIGNATION
// GET /api/designations/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const designation = await Designation.findById(
      req.params.id
    );

    if (!designation) {
      return res.status(404).json({
        message: "Designation not found.",
      });
    }

    res.status(200).json(designation);
  } catch (error) {
    console.error("Get designation error:", error);

    res.status(500).json({
      message: "Failed to load designation.",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE DESIGNATION
// POST /api/designations
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      designationCode,
      designationName,
      designationType,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !designationCode ||
      !designationCode.trim()
    ) {
      return res.status(400).json({
        message: "Designation Code is required.",
      });
    }

    if (
      !designationName ||
      !designationName.trim()
    ) {
      return res.status(400).json({
        message: "Designation Name is required.",
      });
    }

    if (
      !designationType ||
      !designationType.trim()
    ) {
      return res.status(400).json({
        message: "Designation Type is required.",
      });
    }

    // -------------------------------
    // DUPLICATE CHECK
    // -------------------------------

    const existingDesignation =
      await Designation.findOne({
        designationCode:
          designationCode.trim(),
      });

    if (existingDesignation) {
      return res.status(400).json({
        message:
          "Designation Code already exists.",
      });
    }

    // -------------------------------
    // CREATE
    // -------------------------------

    const designation = new Designation({
      designationCode:
        designationCode.trim(),

      designationName:
        designationName.trim(),

      designationType:
        designationType.trim(),
    });

    const savedDesignation =
      await designation.save();

    res.status(201).json({
      message:
        "Designation saved successfully!",

      designation: savedDesignation,
    });
  } catch (error) {
    console.error(
      "Save designation error:",
      error
    );

    // Duplicate MongoDB index error
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Designation Code already exists.",
      });
    }

    res.status(500).json({
      message:
        "Failed to save designation.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE DESIGNATION
// PUT /api/designations/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      designationCode,
      designationName,
      designationType,
    } = req.body;

    if (
      !designationCode ||
      !designationCode.trim()
    ) {
      return res.status(400).json({
        message: "Designation Code is required.",
      });
    }

    if (
      !designationName ||
      !designationName.trim()
    ) {
      return res.status(400).json({
        message: "Designation Name is required.",
      });
    }

    if (
      !designationType ||
      !designationType.trim()
    ) {
      return res.status(400).json({
        message: "Designation Type is required.",
      });
    }

    const duplicate =
      await Designation.findOne({
        designationCode:
          designationCode.trim(),

        _id: {
          $ne: req.params.id,
        },
      });

    if (duplicate) {
      return res.status(400).json({
        message:
          "Designation Code already exists.",
      });
    }

    const updatedDesignation =
      await Designation.findByIdAndUpdate(
        req.params.id,
        {
          designationCode:
            designationCode.trim(),

          designationName:
            designationName.trim(),

          designationType:
            designationType.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedDesignation) {
      return res.status(404).json({
        message: "Designation not found.",
      });
    }

    res.status(200).json({
      message:
        "Designation updated successfully!",

      designation: updatedDesignation,
    });
  } catch (error) {
    console.error(
      "Update designation error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update designation.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE DESIGNATION
// DELETE /api/designations/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedDesignation =
      await Designation.findByIdAndDelete(
        req.params.id
      );

    if (!deletedDesignation) {
      return res.status(404).json({
        message: "Designation not found.",
      });
    }

    res.status(200).json({
      message:
        "Designation deleted successfully!",
    });
  } catch (error) {
    console.error(
      "Delete designation error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete designation.",
      error: error.message,
    });
  }
});

module.exports = router;