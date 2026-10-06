const express = require("express");
const router = express.Router();

const Shift = require("../models/Shift");

// =====================================================
// GET ALL SHIFTS
// GET /api/shifts
// =====================================================

router.get("/", async (req, res) => {
  try {
    const shifts = await Shift.find().sort({
      createdAt: -1,
    });

    res.status(200).json(shifts);
  } catch (error) {
    console.error("Get shifts error:", error);

    res.status(500).json({
      message: "Failed to load shift data.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE SHIFT
// GET /api/shifts/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        message: "Shift not found.",
      });
    }

    res.status(200).json(shift);
  } catch (error) {
    console.error("Get shift error:", error);

    res.status(500).json({
      message: "Failed to load shift.",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE SHIFT
// POST /api/shifts
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      shiftCode,
      shiftName,
      startTime,
      endTime,
    } = req.body;

    if (!shiftCode || !shiftCode.trim()) {
      return res.status(400).json({
        message: "Shift Code is required.",
      });
    }

    if (!shiftName || !shiftName.trim()) {
      return res.status(400).json({
        message: "Shift Name is required.",
      });
    }

    if (!startTime || !startTime.trim()) {
      return res.status(400).json({
        message: "Start Time is required.",
      });
    }

    if (!endTime || !endTime.trim()) {
      return res.status(400).json({
        message: "End Time is required.",
      });
    }

    const existingShift = await Shift.findOne({
      shiftCode: shiftCode.trim(),
    });

    if (existingShift) {
      return res.status(400).json({
        message: "Shift Code already exists.",
      });
    }

    const shift = new Shift({
      shiftCode: shiftCode.trim(),
      shiftName: shiftName.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
    });

    const savedShift = await shift.save();

    res.status(201).json({
      message: "Shift saved successfully!",
      shift: savedShift,
    });
  } catch (error) {
    console.error("Save shift error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Shift Code already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to save shift.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE SHIFT
// PUT /api/shifts/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      shiftCode,
      shiftName,
      startTime,
      endTime,
    } = req.body;

    if (!shiftCode || !shiftCode.trim()) {
      return res.status(400).json({
        message: "Shift Code is required.",
      });
    }

    if (!shiftName || !shiftName.trim()) {
      return res.status(400).json({
        message: "Shift Name is required.",
      });
    }

    if (!startTime || !startTime.trim()) {
      return res.status(400).json({
        message: "Start Time is required.",
      });
    }

    if (!endTime || !endTime.trim()) {
      return res.status(400).json({
        message: "End Time is required.",
      });
    }

    const duplicate = await Shift.findOne({
      shiftCode: shiftCode.trim(),
      _id: {
        $ne: req.params.id,
      },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Shift Code already exists.",
      });
    }

    const updatedShift =
      await Shift.findByIdAndUpdate(
        req.params.id,
        {
          shiftCode: shiftCode.trim(),
          shiftName: shiftName.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedShift) {
      return res.status(404).json({
        message: "Shift not found.",
      });
    }

    res.status(200).json({
      message: "Shift updated successfully!",
      shift: updatedShift,
    });
  } catch (error) {
    console.error("Update shift error:", error);

    res.status(500).json({
      message: "Failed to update shift.",
      error: error.message,
    });
  }
});

module.exports = router;