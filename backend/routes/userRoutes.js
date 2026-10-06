const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Employee = require("../models/Employee");

const router = express.Router();

// =====================================================
// PASSWORD VALIDATION
// =====================================================

const validatePassword = (password) => {
  if (!password) return false;

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*~]/.test(password);

  return (
    password.length >= 5 &&
    hasLetter &&
    hasNumber &&
    hasSpecial
  );
};

// =====================================================
// GENERATE USER ID
// 1, 2, 3, 4...
// =====================================================

const generateUserId = async () => {
  const users = await User.find({})
    .select("userId")
    .lean();

  let maxId = 0;

  users.forEach((user) => {
    const number = parseInt(user.userId, 10);

    if (!isNaN(number) && number > maxId) {
      maxId = number;
    }
  });

  return String(maxId + 1);
};

// =====================================================
// TEST
// GET /api/users/test
// =====================================================

router.get("/test", (req, res) => {
  res.status(200).json({
    message: "User routes are working.",
  });
});

// =====================================================
// GET EMPLOYEES AVAILABLE FOR USER MASTER
// GET /api/users/employees
// =====================================================

router.get("/employees", async (req, res) => {
  try {
    console.log("GET AVAILABLE EMPLOYEES");

    const usedUsers = await User.find({})
      .select("empId")
      .lean();

    const usedEmployeeIds = usedUsers
      .map((user) =>
        String(user.empId || "").trim()
      )
      .filter(Boolean);

    const query = {
      employeeCode: {
        $exists: true,
        $nin: ["", null],
      },
    };

    if (usedEmployeeIds.length > 0) {
      query.employeeCode = {
        $exists: true,
        $nin: ["", null, ...usedEmployeeIds],
      };
    }

    const employees = await Employee.find(query)
      .select(
        "_id employeeCode employeeName unitCode departmentCode"
      )
      .sort({
        employeeCode: 1,
      })
      .lean();

    console.log(
      "Available employees:",
      employees.length
    );

    return res.status(200).json(employees);

  } catch (error) {
    console.error(
      "GET EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch available Employee Master data.",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL USERS
// GET /api/users
// =====================================================

router.get("/", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json(users);

  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE USER
// GET /api/users/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    )
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error(
      "GET SINGLE USER ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE USER
// POST /api/users
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      unit,
      empId,
      userName,
      password,
      validFrom,
      validTo,
      valid,
      msgBeforeDays,
      pwdChangeDays,
      passwordLevel,
      roles,
      authorizedUnits,
    } = req.body;

    // =================================================
    // REQUIRED
    // =================================================

    if (!unit) {
      return res.status(400).json({
        message: "Unit is required.",
      });
    }

    if (!empId) {
      return res.status(400).json({
        message: "Employee ID is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required.",
      });
    }

    if (!validFrom) {
      return res.status(400).json({
        message: "Valid From date is required.",
      });
    }

    if (!validTo) {
      return res.status(400).json({
        message: "Valid To date is required.",
      });
    }

    const cleanUnit = String(unit).trim();
    const cleanEmpId = String(empId).trim();
     const cleanUserName = String(userName || "").trim();

if (!cleanUserName) {
  return res.status(400).json({
    message: "User Name is required",
  });
}

const existingUserName = await User.findOne({
  userName: {
    $regex: `^${cleanUserName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    $options: "i",
  },
  ...(req.body._id ? { _id: { $ne: req.body._id } } : {}),
});

if (existingUserName) {
  return res.status(400).json({
    message: "User Name already exists",
  });
}
    // =================================================
    // PASSWORD VALIDATION
    // =================================================

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 5 characters, a letter, a number and a special character.",
      });
    }

    // =================================================
    // FIND EMPLOYEE IN EMPLOYEE MASTER
    // =================================================

    const employee =
      await Employee.findOne({
        employeeCode: cleanEmpId,
      }).lean();

    if (!employee) {
      return res.status(400).json({
        message:
          `Employee "${cleanEmpId}" does not exist in Employee Master.`,
      });
    }

    // =================================================
    // CHECK EMPLOYEE ALREADY HAS USER
    // =================================================

    const existingEmployeeUser =
      await User.findOne({
        empId: cleanEmpId,
      });

    if (existingEmployeeUser) {
      return res.status(400).json({
        message:
          `Employee "${cleanEmpId}" already exists in User Master.`,
      });
    }

    // =================================================
    // AUTO USER ID
    // =================================================

    const newUserId =
      await generateUserId();

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // =================================================
    // CREATE USER
    // =================================================

    const newUser = new User({
      userId: newUserId,

      unit: cleanUnit,

      empId: cleanEmpId,

      userName:
        employee.employeeName ||
        String(userName || "").trim(),

      password: hashedPassword,

      validFrom,

      validTo,

      valid:
        valid || "YES",

      msgBeforeDays:
        msgBeforeDays === "" ||
        msgBeforeDays === undefined
          ? 0
          : Number(msgBeforeDays),

      pwdChangeDays:
        pwdChangeDays === "" ||
        pwdChangeDays === undefined
          ? 0
          : Number(pwdChangeDays),

      passwordLevel:
        passwordLevel || "USER",

      roles:
        Array.isArray(roles)
          ? roles
          : [],

      authorizedUnits:
        Array.isArray(authorizedUnits)
          ? authorizedUnits
          : [],
    });

    await newUser.save();

    return res.status(201).json({
      message:
        "User created successfully.",

      user: {
        id: newUser._id,
        userId: newUser.userId,
        unit: newUser.unit,
        empId: newUser.empId,
        userName: newUser.userName,
        validFrom: newUser.validFrom,
        validTo: newUser.validTo,
        valid: newUser.valid,
        passwordSet: true,
        msgBeforeDays:
          newUser.msgBeforeDays,
        pwdChangeDays:
          newUser.pwdChangeDays,
        passwordLevel:
          newUser.passwordLevel,
        roles: newUser.roles,
        authorizedUnits:
          newUser.authorizedUnits,
      },
    });

  } catch (error) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "This Employee ID or User ID already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Failed to create user.",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE USER
// PUT /api/users/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      unit,
      empId,
      userName,
      password,
      validFrom,
      validTo,
      valid,
      msgBeforeDays,
      pwdChangeDays,
      passwordLevel,
      roles,
      authorizedUnits,
    } = req.body;

    if (!unit || !empId) {
      return res.status(400).json({
        message:
          "Unit and Employee ID are required.",
      });
    }

    if (!validFrom || !validTo) {
      return res.status(400).json({
        message:
          "Valid From and Valid To are required.",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    const cleanUnit =
      String(unit).trim();

    const cleanEmpId =
      String(empId).trim();

    // =================================================
    // FIND EMPLOYEE
    // =================================================

    const employee =
      await Employee.findOne({
        employeeCode: cleanEmpId,
      }).lean();

    if (!employee) {
      return res.status(400).json({
        message:
          `Employee "${cleanEmpId}" does not exist in Employee Master.`,
      });
    }

    // =================================================
    // CHECK DUPLICATE EMPLOYEE
    // =================================================

    const duplicateEmployee =
      await User.findOne({
        empId: cleanEmpId,
        _id: {
          $ne: req.params.id,
        },
      });

    if (duplicateEmployee) {
      return res.status(400).json({
        message:
          `Employee "${cleanEmpId}" already has another User account.`,
      });
    }

    // =================================================
    // UPDATE
    // =================================================

    user.unit =
      cleanUnit;

    user.empId =
      cleanEmpId;

    user.userName =
      employee.employeeName ||
      String(userName || "").trim();

    user.validFrom =
      validFrom;

    user.validTo =
      validTo;

    user.valid =
      valid || "YES";

    user.msgBeforeDays =
      msgBeforeDays === "" ||
      msgBeforeDays === undefined
        ? 0
        : Number(msgBeforeDays);

    user.pwdChangeDays =
      pwdChangeDays === "" ||
      pwdChangeDays === undefined
        ? 0
        : Number(pwdChangeDays);

    user.passwordLevel =
      passwordLevel || "USER";

    user.roles =
      Array.isArray(roles)
        ? roles
        : [];

    user.authorizedUnits =
      Array.isArray(
        authorizedUnits
      )
        ? authorizedUnits
        : [];

    // =================================================
    // PASSWORD UPDATE
    // =================================================

    if (
      password &&
      String(password).trim()
    ) {
      if (
        !validatePassword(password)
      ) {
        return res.status(400).json({
          message:
            "Password must contain at least 5 characters, a letter, a number and a special character.",
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          10
        );
    }

    await user.save();

    return res.status(200).json({
      message:
        "User updated successfully.",

      user: {
        id: user._id,
        userId: user.userId,
        unit: user.unit,
        empId: user.empId,
        userName: user.userName,
        validFrom: user.validFrom,
        validTo: user.validTo,
        valid: user.valid,
        passwordSet: true,
        passwordLevel:
          user.passwordLevel,
      },
    });

  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update user.",
      error: error.message,
    });
  }
});

// =====================================================
// LOGIN
// POST /api/users/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const {
      userId,
      password,
    } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        message:
          "User ID and password are required.",
      });
    }

    const cleanUserId =
      String(userId)
        .trim()
        .toLowerCase();

    // =================================================
    // SYSTEM ADMIN
    // =================================================

    if (
      cleanUserId === "shipra"
    ) {
      const adminPassword =
        process.env.ADMIN_PASSWORD ||
        "12345";

      if (
        password !==
        adminPassword
      ) {
        return res.status(401).json({
          message:
            "Invalid User ID or password.",
        });
      }

      return res.status(200).json({
        message:
          "Login successful.",

        user: {
          id: "system-admin",
          userId: "shipra",
          userName:
            "Shipra",
          role: "ADMIN",
          passwordLevel:
            "ADMIN",
          valid: "YES",
          isSystemAdmin: true,
        },
      });
    }

    // =================================================
    // NORMAL USER
    // =================================================

const loginValue = String(userId).trim();

const escapedLoginValue = loginValue.replace(
  /[.*+?^${}()|[\]\\]/g,
  "\\$&"
);

const user = await User.findOne({
  $or: [
    { userId: loginValue },
    {
      userName: {
        $regex: `^${escapedLoginValue}$`,
        $options: "i",
      },
    },
  ],
});
     
    // =================================================
    // VALID FROM
    // =================================================

    if (user.validFrom) {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const validFrom =
        new Date(
          `${user.validFrom}T00:00:00`
        );

      if (
        today < validFrom
      ) {
        return res.status(403).json({
          message:
            "This user's account is not active yet.",
        });
      }
    }

    // =================================================
    // VALID TO
    // =================================================

    if (user.validTo) {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const validTo =
        new Date(
          `${user.validTo}T23:59:59`
        );

      if (
        today > validTo
      ) {
        return res.status(403).json({
          message:
            "This user's account validity has expired.",
        });
      }
    }

    // =================================================
    // BCRYPT PASSWORD CHECK
    // =================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid User ID or password.",
      });
    }

    return res.status(200).json({
      message:
        "Login successful.",

      user: {
        id: user._id,
        userId: user.userId,
        userName: user.userName,
        empId: user.empId,
        unit: user.unit,
        passwordLevel:
          user.passwordLevel,
        roles: user.roles,
        authorizedUnits:
          user.authorizedUnits,
        valid: user.valid,
      },
    });

  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Login failed.",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE USER
// DELETE /api/users/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const user =
      await User.findByIdAndDelete(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    return res.status(200).json({
      message:
        "User deleted successfully.",
    });

  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete user.",
      error: error.message,
    });
  }
});

module.exports = router;