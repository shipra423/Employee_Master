const express = require("express");
const router = express.Router();

const UserRights = require("../models/UserRights");

// =====================================================
// MENU LABELS
// =====================================================

const MENU_LABELS = {
  employee: "Employee Master",
  attendance: "Attendance",
  salary: "PF / ESI / Salary",
  security: "Security",
  "sev-rights": "SEV Rights",
};

// =====================================================
// CLEAN RIGHTS
// =====================================================

const cleanRightsData = (rights) => {
  if (!Array.isArray(rights)) {
    return [];
  }

  return rights
    .map((row) => ({
      shortName: String(row?.shortName || "").trim(),

      add: row?.add === true,
      mod: row?.mod === true,
      view: row?.view === true,
      del: row?.del === true,

      fromDate: String(row?.fromDate || ""),
      toDate: String(row?.toDate || ""),
    }))
    .filter((row) => row.shortName);
};

// =====================================================
// GET ALL RIGHTS OF ONE USER
// GET /api/user-rights/:employeeId
// =====================================================

router.get("/:employeeId", async (req, res) => {
  try {
    const employeeId = decodeURIComponent(req.params.employeeId).trim();

    console.log("========================================");
    console.log("GET USER RIGHTS, Employee ID:", employeeId);

    const records = await UserRights.find({ employeeId })
      .sort({ updatedAt: -1 })
      .lean();

    // ---------- NO RIGHTS ----------

    if (!records || records.length === 0) {
      console.log("NO RIGHTS FOUND");

      return res.status(200).json({
        success: true,
        exists: false,
        employeeId,
        userName: "",
        menuOption: "",
        menuOptions: [],
        menus: [],
        rights: [],
      });
    }

    // ---------- MENUS ----------

    const menus = records.map((record) => ({
      menuOption: record.menuOption || "",
      menuLabel:
        record.menuLabel ||
        MENU_LABELS[record.menuOption] ||
        record.menuOption ||
        "",
      rights: cleanRightsData(record.rights),
    }));

    const menuOptions = records
      .map((record) => record.menuOption)
      .filter(Boolean);

    // ---------- ALL RIGHTS COMBINED (duplicate shortName hata ke) ----------

    const seen = new Set();
    const allRights = [];

    records.forEach((record) => {
      cleanRightsData(record.rights).forEach((right) => {
        const key = right.shortName.toLowerCase();

        if (seen.has(key)) {
          return;
        }

        seen.add(key);

        allRights.push({
          ...right,
          menuOption: record.menuOption || "",
          menuLabel:
            record.menuLabel ||
            MENU_LABELS[record.menuOption] ||
            record.menuOption ||
            "",
        });
      });
    });

    console.log("USER NAME:", records[0].userName);
    console.log("MENU OPTIONS:", menuOptions);
    console.log("========================================");

    return res.status(200).json({
      success: true,
      exists: true,
      employeeId,
      userName: records[0].userName || "",

      // UserRights page ke dropdown ke liye
      menuOption: records[0].menuOption || "",

      menuOptions,
      menus,
      rights: allRights,
    });
  } catch (error) {
    console.error("GET USER RIGHTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load user rights",
      error: error.message,
    });
  }
});

// =====================================================
// SAVE / UPDATE USER RIGHTS
// POST /api/user-rights
//
// Frontend poori table (saari rows) bhejta hai, isliye
// ek user ka ek hi document rakhte hain.
// =====================================================

router.post("/", async (req, res) => {
  try {
    const { employeeId, userName, menuOption, menuLabel, rights } = req.body;

    console.log("========================================");
    console.log("SAVE USER RIGHTS");
    console.log("Employee ID:", employeeId);
    console.log("User Name:", userName);
    console.log("Menu Option:", menuOption);
    console.log("Rights:", rights);

    // ---------- VALIDATION ----------

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    if (!userName) {
      return res.status(400).json({
        success: false,
        message: "User Name is required.",
      });
    }

    if (!menuOption) {
      return res.status(400).json({
        success: false,
        message: "Menu option is required.",
      });
    }

    // ---------- CLEAN DATA ----------

    const cleanRights = cleanRightsData(rights);
    const cleanEmployeeId = String(employeeId).trim();
    const cleanUserName = String(userName).trim();
    const cleanMenuOption = String(menuOption).trim();

    const cleanMenuLabel = String(
      menuLabel || MENU_LABELS[cleanMenuOption] || cleanMenuOption
    ).trim();

    // ---------- FIND EXISTING DOCUMENT ----------

    const existingDocs = await UserRights.find({
      employeeId: cleanEmployeeId,
    }).sort({ updatedAt: -1 });

    let savedDoc;

    if (existingDocs.length > 0) {
      // Pehle document ko update karo
      savedDoc = existingDocs[0];

      savedDoc.userName = cleanUserName;
      savedDoc.menuOption = cleanMenuOption;
      savedDoc.menuLabel = cleanMenuLabel;
      savedDoc.rights = cleanRights;

      await savedDoc.save();

      // Baaki duplicate documents hata do
      if (existingDocs.length > 1) {
        const extraIds = existingDocs.slice(1).map((doc) => doc._id);

        await UserRights.deleteMany({ _id: { $in: extraIds } });
      }
    } else {
      // Naya document banao
      savedDoc = await UserRights.create({
        employeeId: cleanEmployeeId,
        userName: cleanUserName,
        menuOption: cleanMenuOption,
        menuLabel: cleanMenuLabel,
        rights: cleanRights,
      });
    }

    const savedRights = savedDoc.toObject();

    console.log("SAVED DATA:", savedRights);
    console.log("========================================");

    return res.status(200).json({
      success: true,
      message: "User rights saved successfully.",
      data: {
        employeeId: savedRights.employeeId,
        userName: savedRights.userName,
        menuOption: savedRights.menuOption,
        menuLabel: savedRights.menuLabel,
        rights: savedRights.rights || [],
      },
    });
  } catch (error) {
    console.error("SAVE USER RIGHTS ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate index error. Purana unique index database se hatao (db.userrights.getIndexes()).",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save user rights",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE ALL RIGHTS OF USER
// DELETE /api/user-rights/user/:employeeId
// (ye route "/:employeeId/:menuOption" se PEHLE rakha hai)
// =====================================================

router.delete("/user/:employeeId", async (req, res) => {
  try {
    const employeeId = decodeURIComponent(req.params.employeeId).trim();

    await UserRights.deleteMany({ employeeId });

    return res.status(200).json({
      success: true,
      message: "All user rights deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ALL USER RIGHTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user rights",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE ONE MENU RIGHTS
// DELETE /api/user-rights/:employeeId/:menuOption
// =====================================================

router.delete("/:employeeId/:menuOption", async (req, res) => {
  try {
    const employeeId = decodeURIComponent(req.params.employeeId).trim();
    const menuOption = decodeURIComponent(req.params.menuOption).trim();

    const deleted = await UserRights.findOneAndDelete({
      employeeId,
      menuOption,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User rights not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu rights deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE MENU RIGHTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete menu rights",
      error: error.message,
    });
  }
});

module.exports = router;