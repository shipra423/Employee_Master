import { useState } from "react";

import Login from "./pages/Login";

import EmployeeMaster from "./pages/EmployeeMaster";
import EmployeeReport from "./pages/EmployeeReport";
import ExcelUpload from "./pages/ExcelUpload";
import Attendance from "./pages/Attendance";
import PFESI from "./pages/PFESI";

// =====================================================
// NEW PAGES
// =====================================================

import BankDetail from "./pages/BankDetail";
import Qualification from "./pages/Qualification";

// =====================================================
// MASTER DATA
// =====================================================

import UnitMaster from "./pages/masters/UnitMaster";
import DepartmentMaster from "./pages/masters/DepartmentMaster";
import ContractorMaster from "./pages/masters/ContractorMaster";
import DesignationMaster from "./pages/masters/DesignationMaster";

// =====================================================
// SECURITY
// =====================================================

import UserMaster from "./pages/security/UserMaster";
import UserRights from "./pages/security/UserRights";

// =====================================================
// ICONS
// =====================================================

import {
  Users,
  CalendarCheck,
  WalletCards,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Building2,
  BriefcaseBusiness,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import "./App.css";

// =====================================================
// STORAGE KEY
// =====================================================

const LOGGED_IN_KEY =
  "employeeMasterLoggedIn";

const CURRENT_USER_KEY =
  "employeeMasterCurrentUser";

const CURRENT_USER_DATA_KEY =
  "employeeMasterCurrentUserData";

// =====================================================
// APP
// =====================================================

function App() {

  // ===================================================
  // LOGIN STATE
  // ===================================================

  const [isLoggedIn, setIsLoggedIn] =
    useState(() => {

      try {

        return (
          localStorage.getItem(
            LOGGED_IN_KEY
          ) === "true"
        );

      } catch {

        return false;

      }

    });

  // ===================================================
  // CURRENT USER
  // ===================================================

  const [currentUser, setCurrentUser] =
    useState(() => {

      try {

        const savedUser =
          localStorage.getItem(
            CURRENT_USER_DATA_KEY
          );

        return savedUser
          ? JSON.parse(savedUser)
          : null;

      } catch {

        return null;

      }

    });

  // ===================================================
  // CURRENT PAGE
  // ===================================================

  const [currentForm, setCurrentForm] =
    useState("employee");

  // ===================================================
  // EMPLOYEE MENU
  // ===================================================

  const [employeeMenuOpen, setEmployeeMenuOpen] =
    useState(true);

  // ===================================================
  // MASTER MENU
  // ===================================================

  const [masterMenuOpen, setMasterMenuOpen] =
    useState(false);

  // ===================================================
  // SECURITY MENU
  // ===================================================

  const [securityMenuOpen, setSecurityMenuOpen] =
    useState(false);

  // ===================================================
  // LOGIN SUCCESS
  // ===================================================

  const handleLogin = (user) => {

    console.log(
      "APP LOGIN SUCCESS:",
      user
    );

    // -----------------------------------------------
    // SAVE LOGIN STATE
    // -----------------------------------------------

    localStorage.setItem(
      LOGGED_IN_KEY,
      "true"
    );

    // -----------------------------------------------
    // SAVE CURRENT USER
    // -----------------------------------------------

    if (user) {

      localStorage.setItem(
        CURRENT_USER_KEY,
        String(
          user.userId || ""
        )
      );

      localStorage.setItem(
        CURRENT_USER_DATA_KEY,
        JSON.stringify(user)
      );

      setCurrentUser(user);

    }

    // -----------------------------------------------
    // UPDATE STATE
    // -----------------------------------------------

    setIsLoggedIn(true);

    setCurrentForm("employee");

    setEmployeeMenuOpen(true);

    setMasterMenuOpen(false);

    setSecurityMenuOpen(false);
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    // -----------------------------------------------
    // REMOVE LOGIN SESSION
    // -----------------------------------------------

    localStorage.removeItem(
      LOGGED_IN_KEY
    );

    localStorage.removeItem(
      CURRENT_USER_KEY
    );

    localStorage.removeItem(
      CURRENT_USER_DATA_KEY
    );

    // -----------------------------------------------
    // UPDATE STATE
    // -----------------------------------------------

    setIsLoggedIn(false);

    setCurrentUser(null);

    setCurrentForm("employee");

    setEmployeeMenuOpen(true);

    setMasterMenuOpen(false);

    setSecurityMenuOpen(false);

    console.log(
      "USER LOGGED OUT"
    );
  };

  // ===================================================
  // OPEN MASTER
  // ===================================================

  const openMaster = (formName) => {

    setMasterMenuOpen(true);

    setCurrentForm(formName);
  };

  // ===================================================
  // LOGIN PAGE
  // ===================================================

  if (!isLoggedIn) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );

  }

  // ===================================================
  // MAIN APPLICATION
  // ===================================================

  return (

    <div className="app-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="sidebar-logo">

          <div className="logo-box">

            <img
              src="/sai-logo.png"
              alt="SAI Logo"
              className="sai-logo"
            />

          </div>

          <div>

            <h2>
              SAI
            </h2>

          </div>

        </div>

        {/* =================================================
            LOGGED USER
        ================================================= */}

        {currentUser && (

          <div className="sidebar-user">

            <div className="sidebar-user-name">

              {currentUser.userName ||
                currentUser.userId ||
                "User"}

            </div>

            <div className="sidebar-user-role">

              {currentUser.role ||
                currentUser.passwordLevel ||
                "USER"}

            </div>

          </div>

        )}

        {/* =================================================
            MENU
        ================================================= */}

        <div className="sidebar-menu">

          {/* =================================================
              1. EMPLOYEE MASTER
          ================================================= */}

          <button
            type="button"
            className={
              currentForm === "employee" ||
              currentForm === "employeeReport" ||
              currentForm === "excelUpload" ||
              currentForm === "unitMaster" ||
              currentForm === "departmentMaster" ||
              currentForm === "contractorMaster" ||
              currentForm === "designationMaster" ||
              currentForm === "bankDetail" ||
              currentForm === "qualification"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => {

              setEmployeeMenuOpen(
                !employeeMenuOpen
              );

              setCurrentForm(
                "employee"
              );

            }}
          >

            <Users size={19} />

            <div className="menu-text">

              <strong>
                1. Employee Master
              </strong>

              <small>
                Employee details
              </small>

            </div>

            <div className="menu-arrow">

              {employeeMenuOpen ? (

                <ChevronDown
                  size={17}
                />

              ) : (

                <ChevronRight
                  size={17}
                />

              )}

            </div>

          </button>

          {/* =================================================
              EMPLOYEE SUBMENU
          ================================================= */}

          {employeeMenuOpen && (

            <div className="submenu">

              {/* EMPLOYEE LIST */}

              <button
                type="button"
                className={
                  currentForm === "employee"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setCurrentForm(
                    "employee"
                  )
                }
              >

                <Users size={16} />

                <span>
                  Employee List
                </span>

              </button>

              {/* =================================================
                  EMPLOYEE REPORT
              ================================================= */}

              <button
                type="button"
                className={
                  currentForm === "employeeReport"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setCurrentForm(
                    "employeeReport"
                  )
                }
              >

                <FileSpreadsheet
                  size={16}
                />

                <span>
                  Employee Report
                </span>

              </button>

              {/* =================================================
                  EXCEL
              ================================================= */}

              <button
                type="button"
                className={
                  currentForm === "excelUpload"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setCurrentForm(
                    "excelUpload"
                  )
                }
              >

                <FileSpreadsheet
                  size={16}
                />

                <span>
                  Excel / CSV Upload
                </span>

              </button>

              {/* =================================================
                  MASTER DATA
              ================================================= */}

              <button
                type="button"
                className={
                  currentForm === "unitMaster" ||
                  currentForm === "departmentMaster" ||
                  currentForm === "contractorMaster" ||
                  currentForm === "designationMaster"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setMasterMenuOpen(
                    !masterMenuOpen
                  )
                }
              >

                <Building2 size={16} />

                <span>
                  Master Data
                </span>

                {masterMenuOpen ? (

                  <ChevronDown
                    size={15}
                  />

                ) : (

                  <ChevronRight
                    size={15}
                  />

                )}

              </button>

              {/* =================================================
                  MASTER SUBMENU
              ================================================= */}

              {masterMenuOpen && (

                <div className="submenu">

                  {/* UNIT */}

                  <button
                    type="button"
                    className={
                      currentForm ===
                      "unitMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() =>
                      openMaster(
                        "unitMaster"
                      )
                    }
                  >

                    <Building2
                      size={15}
                    />

                    <span>
                      Unit Master
                    </span>

                  </button>

                  {/* DEPARTMENT */}

                  <button
                    type="button"
                    className={
                      currentForm ===
                      "departmentMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() =>
                      openMaster(
                        "departmentMaster"
                      )
                    }
                  >

                    <Building2
                      size={15}
                    />

                    <span>
                      Department Master
                    </span>

                  </button>

                  {/* CONTRACTOR */}

                  <button
                    type="button"
                    className={
                      currentForm ===
                      "contractorMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() =>
                      openMaster(
                        "contractorMaster"
                      )
                    }
                  >

                    <Users
                      size={15}
                    />

                    <span>
                      Contractor Master
                    </span>

                  </button>

                  {/* DESIGNATION */}

                  <button
                    type="button"
                    className={
                      currentForm ===
                      "designationMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() =>
                      openMaster(
                        "designationMaster"
                      )
                    }
                  >

                    <BriefcaseBusiness
                      size={15}
                    />

                    <span>
                      Designation Master
                    </span>

                  </button>

                </div>

              )}

            </div>

          )}

          {/* =================================================
              2. ATTENDANCE
          ================================================= */}

          <button
            type="button"
            className={
              currentForm === "attendance"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => {

              setCurrentForm(
                "attendance"
              );

            }}
          >

            <CalendarCheck
              size={19}
            />

            <div className="menu-text">

              <strong>
                2. Attendance
              </strong>

              <small>
                Attendance records
              </small>

            </div>

          </button>

          {/* =================================================
              3. PF / ESI / SALARY
          ================================================= */}

          <button
            type="button"
            className={
              currentForm === "pfesi"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => {

              setCurrentForm(
                "pfesi"
              );

            }}
          >

            <WalletCards
              size={19}
            />

            <div className="menu-text">

              <strong>
                3. PF / ESI / Salary
              </strong>

              <small>
                Salary details
              </small>

            </div>

          </button>

          {/* =================================================
              4. SECURITY
          ================================================= */}

          <button
            type="button"
            className={
              currentForm === "userMaster" ||
              currentForm === "userRights"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => {

              setSecurityMenuOpen(
                !securityMenuOpen
              );

              setCurrentForm(
                "userMaster"
              );

            }}
          >

            <ShieldCheck
              size={19}
            />

            <div className="menu-text">

              <strong>
                4. Security
              </strong>

              <small>
                Security management
              </small>

            </div>

            <div className="menu-arrow">

              {securityMenuOpen ? (

                <ChevronDown
                  size={17}
                />

              ) : (

                <ChevronRight
                  size={17}
                />

              )}

            </div>

          </button>

          {/* =================================================
              SECURITY SUBMENU
          ================================================= */}

          {securityMenuOpen && (

            <div className="submenu">

              {/* USER MASTER */}

              <button
                type="button"
                className={
                  currentForm === "userMaster"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setCurrentForm(
                    "userMaster"
                  )
                }
              >

                <Users
                  size={16}
                />

                <span>
                  User Master
                </span>

              </button>

              {/* USER RIGHTS */}

              <button
                type="button"
                className={
                  currentForm === "userRights"
                    ? "submenu-item active-submenu"
                    : "submenu-item"
                }
                onClick={() =>
                  setCurrentForm(
                    "userRights"
                  )
                }
              >

                <ShieldCheck
                  size={16}
                />

                <span>
                  User Rights
                </span>

              </button>

            </div>

          )}

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-btn"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            EMPLOYEE INFORMATION
        ================================================= */}

        {currentForm === "employee" && (

          <EmployeeMaster

            onBankDetail={() =>
              setCurrentForm(
                "bankDetail"
              )
            }

            onQualification={() =>
              setCurrentForm(
                "qualification"
              )
            }

          />

        )}

        {/* =================================================
            EMPLOYEE REPORT
        ================================================= */}

        {currentForm === "employeeReport" && (

          <EmployeeReport

            onEmployeeInformation={() =>
              setCurrentForm(
                "employee"
              )
            }

          />

        )}

        {/* =================================================
            BANK DETAIL
        ================================================= */}

        {currentForm === "bankDetail" && (

          <BankDetail

            onEmployeeInformation={() =>
              setCurrentForm(
                "employee"
              )
            }

            onQualification={() =>
              setCurrentForm(
                "qualification"
              )
            }

          />

        )}

        {/* =================================================
            QUALIFICATION
        ================================================= */}

        {currentForm === "qualification" && (

          <Qualification

            onEmployeeInformation={() =>
              setCurrentForm(
                "employee"
              )
            }

            onBankDetail={() =>
              setCurrentForm(
                "bankDetail"
              )
            }

          />

        )}

        {/* =================================================
            EXCEL
        ================================================= */}

        {currentForm === "excelUpload" && (

          <ExcelUpload />

        )}

        {/* =================================================
            UNIT
        ================================================= */}

        {currentForm === "unitMaster" && (

          <UnitMaster />

        )}

        {/* =================================================
            DEPARTMENT
        ================================================= */}

        {currentForm === "departmentMaster" && (

          <DepartmentMaster />

        )}

        {/* =================================================
            CONTRACTOR
        ================================================= */}

        {currentForm === "contractorMaster" && (

          <ContractorMaster />

        )}

        {/* =================================================
            DESIGNATION
        ================================================= */}

        {currentForm === "designationMaster" && (

          <DesignationMaster />

        )}

        {/* =================================================
            ATTENDANCE
        ================================================= */}

        {currentForm === "attendance" && (

          <Attendance />

        )}

        {/* =================================================
            PF ESI
        ================================================= */}

        {currentForm === "pfesi" && (

          <PFESI />

        )}

        {/* =================================================
            USER MASTER
        ================================================= */}

        {currentForm === "userMaster" && (

          <UserMaster />

        )}

        {/* =================================================
            USER RIGHTS
        ================================================= */}

        {currentForm === "userRights" && (

          <UserRights />

        )}

      </main>

    </div>
  );
}

export default App;