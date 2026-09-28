
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// =====================================================
// ROUTES
// =====================================================

const employeeRoutes = require("./routes/employeeRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const unitRoute = require("./routes/unitRoute");
const departmentRoute = require("./routes/departmentRoute");
const contractorRoute = require("./routes/contractorRoute");
const designationRoute = require("./routes/designationRoute");



// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

dotenv.config();


// =====================================================
// APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// =====================================================
// MONGODB CONNECTION
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

// Employee Master
app.use(
  "/api/employees",
  employeeRoutes
);

// PF / ESI / Salary
app.use(
  "/api/salary",
  salaryRoutes
);

// Attendance
app.use(
  "/api/attendance",
  attendanceRoutes
);

app.use("/api/units", unitRoute);

app.use("/api/departments", departmentRoute);


app.use(
  "/api/contractors",
  contractorRoute
);

 app.use( "/api/designations", designationRoute );

 
// =====================================================
// HOME / TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send(
    "Employee Master Backend is running"
  );
});


// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});

