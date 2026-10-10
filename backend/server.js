const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const employeeRoutes = require("./routes/employeeRoutes");
const employeeMediaRoutes = require("./routes/employeeMediaRoutes");

const salaryRoutes = require("./routes/salaryRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const unitRoute = require("./routes/unitRoute");
const departmentRoute = require("./routes/departmentRoute");
const contractorRoute = require("./routes/contractorRoute");
const designationRoute = require("./routes/designationRoute");
const shiftRoute = require("./routes/shiftRoute");

const userRoutes = require("./routes/userRoutes");
const userRightsRoutes = require("./routes/userRightsRoutes");
const excelUploadRoutes = require("./routes/excelUploadRoutes");

const bankDetailRoutes =
  require("./routes/bankDetailRoutes");

const qualificationRoutes =
  require("./routes/qualificationRoutes");

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// =====================================================
// MONGODB
// =====================================================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/employee_master";

mongoose
  .connect(MONGO_URI)
  .then(() => {

    console.log(
      "Employee Master MongoDB Connected Successfully"
    );

  })
  .catch((error) => {

    console.error(
      "MongoDB Connection Failed:",
      error.message
    );

  });

// =====================================================
// API ROUTES
// =====================================================

// EMPLOYEE
app.use(
  "/api/employees",
  employeeRoutes
);

// EMPLOYEE PHOTO + DOCUMENT
app.use(
  "/api/employee-media",
  employeeMediaRoutes
);

// SALARY
app.use(
  "/api/salary",
  salaryRoutes
);

// ATTENDANCE
app.use(
  "/api/attendance",
  attendanceRoutes
);

// UNIT
app.use(
  "/api/units",
  unitRoute
);

// DEPARTMENT
app.use(
  "/api/departments",
  departmentRoute
);

// CONTRACTOR
app.use(
  "/api/contractors",
  contractorRoute
);

// DESIGNATION
app.use(
  "/api/designations",
  designationRoute
);

// SHIFT
app.use("/api/shifts", shiftRoute);

// USERS
app.use(
  "/api/users",
  userRoutes
);

// USER RIGHTS
app.use("/api/user-rights", userRightsRoutes);

// EXCEL UPLOAD
app.use(
  "/api/excel-upload",
  excelUploadRoutes
);

// BANK DETAILS
app.use(
  "/api/bank-details",
  bankDetailRoutes
);

// QUALIFICATION
app.use(
  "/api/qualifications",
  qualificationRoutes
);

// =====================================================
// ROOT
// =====================================================

app.get(
  "/",
  (req, res) => {

    res.send(
      "Employee Master Backend is running"
    );

  }
);

// =====================================================
// 404
// =====================================================

app.use(
  (req, res) => {

    res.status(404).json({

      message:
        "API route not found",

      path:
        req.originalUrl,

    });

  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    );

  }
);