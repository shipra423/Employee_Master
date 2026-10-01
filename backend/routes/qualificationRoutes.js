const express = require("express");

const router = express.Router();

const Qualification = require(
  "../models/Qualification"
);


// GET ALL
router.get("/", async (req, res) => {
  try {
    const data =
      await Qualification.find()
        .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch qualifications.",
    });
  }
});


// GET BY EMPLOYEE
router.get(
  "/employee/:employeeCode",
  async (req, res) => {
    try {
      const data =
        await Qualification.findOne({
          employeeCode:
            req.params.employeeCode,
        });

      if (!data) {
        return res.status(404).json({
          message:
            "Qualification not found.",
        });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch qualification.",
      });
    }
  }
);


// CREATE
router.post("/", async (req, res) => {
  try {
    const existing =
      await Qualification.findOne({
        employeeCode:
          req.body.employeeCode,
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Qualification already exists for this employee.",
      });
    }

    const data =
      await Qualification.create(
        req.body
      );

    res.status(201).json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to save qualification.",
    });
  }
});


// UPDATE
router.put(
  "/:id",
  async (req, res) => {
    try {
      const data =
        await Qualification.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

      if (!data) {
        return res.status(404).json({
          message:
            "Qualification not found.",
        });
      }

      res.json(data);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update qualification.",
      });
    }
  }
);


module.exports = router;