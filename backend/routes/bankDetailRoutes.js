const express = require("express");

const router = express.Router();

const BankDetail = require(
  "../models/BankDetail"
);


// GET ALL
router.get("/", async (req, res) => {
  try {
    const data =
      await BankDetail.find()
        .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch bank details.",
    });
  }
});


// GET BY EMPLOYEE CODE
router.get(
  "/employee/:employeeCode",
  async (req, res) => {
    try {
      const data =
        await BankDetail.findOne({
          employeeCode:
            req.params.employeeCode,
        });

      if (!data) {
        return res.status(404).json({
          message:
            "Bank detail not found.",
        });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch bank detail.",
      });
    }
  }
);


// CREATE
router.post("/", async (req, res) => {
  try {
    const existing =
      await BankDetail.findOne({
        employeeCode:
          req.body.employeeCode,
      });

    if (existing) {
      return res.status(400).json({
        message:
          "Bank detail already exists for this employee.",
      });
    }

    const data =
      await BankDetail.create(
        req.body
      );

    res.status(201).json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to save bank details.",
    });
  }
});


// UPDATE
router.put(
  "/:id",
  async (req, res) => {
    try {
      const data =
        await BankDetail.findByIdAndUpdate(
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
            "Bank detail not found.",
        });
      }

      res.json(data);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update bank details.",
      });
    }
  }
);


module.exports = router;