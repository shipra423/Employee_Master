const express = require("express");
const router = express.Router();

const Unit = require("../models/Unit");

// =====================================================
// GET ALL UNITS
// GET /api/units
// =====================================================

router.get("/", async (req, res) => {
  try {
    const units = await Unit.find().sort({
      createdAt: -1,
    });

    res.status(200).json(units);
  } catch (error) {
    console.error("Get units error:", error);

    res.status(500).json({
      message: "Failed to load units",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE UNIT
// GET /api/units/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        message: "Unit not found.",
      });
    }

    res.status(200).json(unit);
  } catch (error) {
    console.error("Get single unit error:", error);

    res.status(500).json({
      message: "Failed to load unit.",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE NEW UNIT
// POST /api/units
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      unitCode,
      unitName,
      unitType,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED VALIDATION
    // -------------------------------------------------

    if (!unitCode || !unitCode.trim()) {
      return res.status(400).json({
        message: "Unit Code is required.",
      });
    }

    if (!unitName || !unitName.trim()) {
      return res.status(400).json({
        message: "Unit Name is required.",
      });
    }

    if (!unitType || !unitType.trim()) {
      return res.status(400).json({
        message: "Unit Type is required.",
      });
    }

    // -------------------------------------------------
    // DUPLICATE UNIT CODE CHECK
    // -------------------------------------------------

    const existingUnit = await Unit.findOne({
      unitCode: unitCode.trim(),
    });

    if (existingUnit) {
      return res.status(400).json({
        message: "Unit Code already exists.",
      });
    }

    // -------------------------------------------------
    // CREATE UNIT
    // -------------------------------------------------

    const unit = new Unit({
      unitCode: unitCode.trim(),
      unitName: unitName.trim(),
      unitType: unitType.trim(),
    });

    const savedUnit = await unit.save();

    res.status(201).json({
      message: "Unit saved successfully!",
      unit: savedUnit,
    });
  } catch (error) {
    console.error("Save unit error:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Unit Code already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to save unit.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE UNIT
// PUT /api/units/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      unitCode,
      unitName,
      unitType,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED VALIDATION
    // -------------------------------------------------

    if (!unitCode || !unitCode.trim()) {
      return res.status(400).json({
        message: "Unit Code is required.",
      });
    }

    if (!unitName || !unitName.trim()) {
      return res.status(400).json({
        message: "Unit Name is required.",
      });
    }

    if (!unitType || !unitType.trim()) {
      return res.status(400).json({
        message: "Unit Type is required.",
      });
    }

    // -------------------------------------------------
    // CHECK DUPLICATE UNIT CODE
    // Ignore current unit while checking
    // -------------------------------------------------

    const existingUnit = await Unit.findOne({
      unitCode: unitCode.trim(),
      _id: {
        $ne: req.params.id,
      },
    });

    if (existingUnit) {
      return res.status(400).json({
        message: "Unit Code already exists.",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const updatedUnit =
      await Unit.findByIdAndUpdate(
        req.params.id,
        {
          unitCode: unitCode.trim(),
          unitName: unitName.trim(),
          unitType: unitType.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    // -------------------------------------------------
    // NOT FOUND
    // -------------------------------------------------

    if (!updatedUnit) {
      return res.status(404).json({
        message: "Unit not found.",
      });
    }

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      message: "Unit updated successfully!",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Update unit error:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Unit Code already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to update unit.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE UNIT
// DELETE /api/units/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedUnit =
      await Unit.findByIdAndDelete(
        req.params.id
      );

    if (!deletedUnit) {
      return res.status(404).json({
        message: "Unit not found.",
      });
    }

    res.status(200).json({
      message: "Unit deleted successfully!",
    });
  } catch (error) {
    console.error("Delete unit error:", error);

    res.status(500).json({
      message: "Failed to delete unit.",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;