const express = require("express");
const router = express.Router();

const Contractor = require("../models/Contractor");

// =====================================================
// GET ALL CONTRACTORS
// GET /api/contractors
// =====================================================

router.get("/", async (req, res) => {
  try {
    const contractors = await Contractor.find().sort({
      createdAt: -1,
    });

    res.status(200).json(contractors);
  } catch (error) {
    console.error(
      "Get contractors error:",
      error
    );

    res.status(500).json({
      message: "Failed to load contractors.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE CONTRACTOR
// GET /api/contractors/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const contractor =
      await Contractor.findById(req.params.id);

    if (!contractor) {
      return res.status(404).json({
        message: "Contractor not found.",
      });
    }

    res.status(200).json(contractor);
  } catch (error) {
    console.error(
      "Get contractor error:",
      error
    );

    res.status(500).json({
      message: "Failed to load contractor.",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE CONTRACTOR
// POST /api/contractors
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      contractorCode,
      contractorName,
      contractorType,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !contractorCode ||
      !contractorCode.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Code is required.",
      });
    }

    if (
      !contractorName ||
      !contractorName.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Name is required.",
      });
    }

    if (
      !contractorType ||
      !contractorType.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Type is required.",
      });
    }

    // -------------------------------------------------
    // DUPLICATE CHECK
    // -------------------------------------------------

    const existingContractor =
      await Contractor.findOne({
        contractorCode:
          contractorCode.trim(),
      });

    if (existingContractor) {
      return res.status(400).json({
        message:
          "Contractor Code already exists.",
      });
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------

    const contractor = new Contractor({
      contractorCode:
        contractorCode.trim(),

      contractorName:
        contractorName.trim(),

      contractorType:
        contractorType.trim(),
    });

    const savedContractor =
      await contractor.save();

    res.status(201).json({
      message:
        "Contractor saved successfully!",

      contractor: savedContractor,
    });
  } catch (error) {
    console.error(
      "Save contractor error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Contractor Code already exists.",
      });
    }

    res.status(500).json({
      message:
        "Failed to save contractor.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE CONTRACTOR
// PUT /api/contractors/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      contractorCode,
      contractorName,
      contractorType,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !contractorCode ||
      !contractorCode.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Code is required.",
      });
    }

    if (
      !contractorName ||
      !contractorName.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Name is required.",
      });
    }

    if (
      !contractorType ||
      !contractorType.trim()
    ) {
      return res.status(400).json({
        message: "Contractor Type is required.",
      });
    }

    // -------------------------------------------------
    // DUPLICATE CHECK
    // -------------------------------------------------

    const existingContractor =
      await Contractor.findOne({
        contractorCode:
          contractorCode.trim(),

        _id: {
          $ne: req.params.id,
        },
      });

    if (existingContractor) {
      return res.status(400).json({
        message:
          "Contractor Code already exists.",
      });
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------

    const updatedContractor =
      await Contractor.findByIdAndUpdate(
        req.params.id,

        {
          contractorCode:
            contractorCode.trim(),

          contractorName:
            contractorName.trim(),

          contractorType:
            contractorType.trim(),
        },

        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedContractor) {
      return res.status(404).json({
        message: "Contractor not found.",
      });
    }

    res.status(200).json({
      message:
        "Contractor updated successfully!",

      contractor:
        updatedContractor,
    });
  } catch (error) {
    console.error(
      "Update contractor error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Contractor Code already exists.",
      });
    }

    res.status(500).json({
      message:
        "Failed to update contractor.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE CONTRACTOR
// DELETE /api/contractors/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const deletedContractor =
      await Contractor.findByIdAndDelete(
        req.params.id
      );

    if (!deletedContractor) {
      return res.status(404).json({
        message: "Contractor not found.",
      });
    }

    res.status(200).json({
      message:
        "Contractor deleted successfully!",
    });
  } catch (error) {
    console.error(
      "Delete contractor error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete contractor.",
      error: error.message,
    });
  }
});

module.exports = router;