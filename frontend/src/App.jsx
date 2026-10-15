import { useEffect, useState } from "react";

import Login from "./pages/Login";

import EmployeeMaster from "./pages/EmployeeMaster";
import EmployeeReport from "./pages/EmployeeReport";
import ExcelUpload from "./pages/ExcelUpload";
import Attendance from "./pages/Attendance";
import PFESI from "./pages/PFESI";

import BankDetail from "./pages/BankDetail";
import Qualification from "./pages/Qualification";

import UnitMaster from "./pages/masters/UnitMaster";
import DepartmentMaster from "./pages/masters/DepartmentMaster";
import ContractorMaster from "./pages/masters/ContractorMaster";
import DesignationMaster from "./pages/masters/DesignationMaster";
import ShiftMaster from "./pages/masters/ShiftMaster";

import UserMaster from "./pages/security/UserMaster";
import UserRights from "./pages/security/UserRights";

import SalaryUpload from "./pages/SalaryUpload";
import SalaryStatement from "./pages/SalaryStatement";

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
// STORAGE KEYS
// =====================================================

const LOGGED_IN_KEY = "employeeMasterLoggedIn";
const CURRENT_USER_KEY = "employeeMasterCurrentUser";
const CURRENT_USER_DATA_KEY = "employeeMasterCurrentUserData";
const USER_RIGHTS_KEY = "employeeMasterUserRights";

// =====================================================
// RIGHTS CONFIG
// =====================================================

const RIGHTS_API_URL = "http://localhost:5000/api/user-rights";

const ALL_MENUS = ["employee", "attendance", "salary", "security", "sev-rights"];

// UserRights page ka "Short Name" -> menu key
const SHORTNAME_TO_MENU = {
  "employee master": "employee",
  employee: "employee",
  attendance: "attendance",
  "pf / esi / salary": "salary",
  salary: "salary",
  security: "security",
  "sev rights": "sev-rights",
  "sev-rights": "sev-rights",
};

const checkAdmin = (user) =>
  user?.isSystemAdmin === true ||
  String(user?.role || "").toUpperCase() === "ADMIN" ||
  String(user?.passwordLevel || "").toUpperCase() === "ADMIN";

// =====================================================
// APP
// =====================================================

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(LOGGED_IN_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_DATA_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [userRights, setUserRights] = useState(() => {
    try {
      const savedRights = localStorage.getItem(USER_RIGHTS_KEY);
      return savedRights ? JSON.parse(savedRights) : [];
    } catch {
      return [];
    }
  });

  const [rightsLoading, setRightsLoading] = useState(false);
  const [currentForm, setCurrentForm] = useState("employee");

  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState(
    () => localStorage.getItem("selectedEmployeeCode") || ""
  );

  const handleEmployeeSelect = (employeeCode) => {
    const code = String(employeeCode || "").trim();

    setSelectedEmployeeCode(code);

    if (code) {
      localStorage.setItem("selectedEmployeeCode", code);
    } else {
      localStorage.removeItem("selectedEmployeeCode");
    }
  };

  // ---------------- MENUS OPEN / CLOSE ----------------

  const [employeeMenuOpen, setEmployeeMenuOpen] = useState(true);
  const [masterMenuOpen, setMasterMenuOpen] = useState(false);
  const [securityMenuOpen, setSecurityMenuOpen] = useState(false);
  const [salaryMenuOpen, setSalaryMenuOpen] = useState(false);

  const isAdmin = checkAdmin(currentUser);

  // ===================================================
  // FIRST ALLOWED PAGE
  // ===================================================

  const goToFirstAllowedForm = (rightsList) => {
    if (rightsList.includes("employee")) {
      setCurrentForm("employee");
    } else if (rightsList.includes("attendance")) {
      setCurrentForm("attendance");
    } else if (rightsList.includes("salary")) {
      setCurrentForm("pfesi");
    } else if (rightsList.includes("security")) {
      setCurrentForm("userMaster");
    } else {
      setCurrentForm("");
    }
  };

  const saveRights = (rightsList) => {
    setUserRights(rightsList);
    localStorage.setItem(USER_RIGHTS_KEY, JSON.stringify(rightsList));
  };

  // ===================================================
  // LOAD USER RIGHTS
  // ===================================================

  const loadUserRights = async (user) => {
    // ADMIN = ALL RIGHTS
    if (checkAdmin(user)) {
      saveRights([...ALL_MENUS]);
      return;
    }

    // UserRights page "empId" se save karta hai
    const employeeId = String(user?.empId || user?.userId || "").trim();

    if (!employeeId) {
      saveRights([]);
      setCurrentForm("");
      return;
    }

    try {
      setRightsLoading(true);

      console.log("LOADING RIGHTS FOR:", employeeId);

      const response = await fetch(
        `${RIGHTS_API_URL}/${encodeURIComponent(employeeId)}`
      );

      if (!response.ok) {
        throw new Error("Unable to load user rights.");
      }

      let data = await response.json();

      console.log("USER RIGHTS RESPONSE:", data);

      // empId se kuch nahi mila to userId se try karo
      if (
        data?.exists === false &&
        user?.userId &&
        String(user.userId).trim() !== employeeId
      ) {
        const retry = await fetch(
          `${RIGHTS_API_URL}/${encodeURIComponent(String(user.userId).trim())}`
        );

        if (retry.ok) {
          data = await retry.json();
          console.log("USER RIGHTS RESPONSE (userId retry):", data);
        }
      }

      let rightsList = [];

      const addMenu = (menu) => {
        const m = String(menu || "").trim().toLowerCase();

        if (!m) return;

        if (m === "all") {
          ALL_MENUS.forEach((item) => {
            if (!rightsList.includes(item)) rightsList.push(item);
          });
        } else if (!rightsList.includes(m)) {
          rightsList.push(m);
        }
      };

      // MAIN: data.rights = [{ shortName, add, mod, view, del }]
      if (Array.isArray(data?.rights)) {
        data.rights.forEach((r) => {
          const key = String(r?.shortName || "").trim().toLowerCase();
          const menu = SHORTNAME_TO_MENU[key];

          const hasAnyPermission =
            r?.view === true ||
            r?.add === true ||
            r?.mod === true ||
            r?.del === true;

          if (menu && hasAnyPermission) {
            addMenu(menu);
          }
        });
      }

      // FALLBACK 1: { exists: true, menuOption: "employee" }
      if (
        rightsList.length === 0 &&
        data?.exists &&
        data?.menuOption &&
        !Array.isArray(data?.rights)
      ) {
        addMenu(data.menuOption);
      }

      // FALLBACK 2: backend array
      if (Array.isArray(data)) {
        data.forEach((item) => addMenu(item?.menuOption || item?.menu));
      }

      // FALLBACK 3: { menus: [...] }
      if (Array.isArray(data?.menus)) {
        data.menus.forEach((menuItem) =>
          addMenu(menuItem?.menuOption || menuItem?.value || menuItem)
        );
      }

      console.log("FINAL USER RIGHTS:", rightsList);

      saveRights(rightsList);
      goToFirstAllowedForm(rightsList);
    } catch (error) {
      console.error("LOAD USER RIGHTS ERROR:", error);

      saveRights([]);
      setCurrentForm("");
    } finally {
      setRightsLoading(false);
    }
  };

  // ===================================================
  // CHECK MENU RIGHT
  // ===================================================

  const hasRight = (menu) => {
    if (isAdmin) return true;
    return userRights.includes(menu);
  };

  // ===================================================
  // LOGIN SUCCESS
  // ===================================================

  const handleLogin = async (user) => {
    console.log("APP LOGIN SUCCESS:", user);

    localStorage.setItem(LOGGED_IN_KEY, "true");

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, String(user.userId || ""));
      localStorage.setItem(CURRENT_USER_DATA_KEY, JSON.stringify(user));
      setCurrentUser(user);
    }

    setIsLoggedIn(true);
    setEmployeeMenuOpen(true);
    setMasterMenuOpen(false);
    setSecurityMenuOpen(false);
    setSalaryMenuOpen(false);

    await loadUserRights(user);
  };

  // LOAD RIGHTS AFTER REFRESH
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadUserRights(currentUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem(LOGGED_IN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_USER_DATA_KEY);
    localStorage.removeItem(USER_RIGHTS_KEY);

    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRights([]);
    setCurrentForm("employee");
    setEmployeeMenuOpen(true);
    setMasterMenuOpen(false);
    setSecurityMenuOpen(false);
    setSalaryMenuOpen(false);

    console.log("USER LOGGED OUT");
  };

  // ===================================================
  // NAVIGATION
  // ===================================================

  const openMaster = (formName) => {
    setMasterMenuOpen(true);
    setCurrentForm(formName);
  };

  const openForm = (formName, requiredRight) => {
    if (!hasRight(requiredRight)) return;
    setCurrentForm(formName);
  };

  // LOGIN PAGE
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // RIGHTS LOADING
  if (!isAdmin && rightsLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Loading user rights...
      </div>
    );
  }

  const hasAnyMenu = isAdmin || userRights.length > 0;

  // ===================================================
  // MAIN APPLICATION
  // ===================================================

  return (
    <div className="app-layout">
      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-box">
            <img src="/sai-logo.png" alt="SAI Logo" className="sai-logo" />
          </div>

          <div>
            <h2>SAI</h2>
          </div>
        </div>

        {currentUser && (
          <div className="sidebar-user">
            <div className="sidebar-user-name">
              {currentUser.userName || currentUser.userId || "User"}
            </div>

            <div className="sidebar-user-role">
              {currentUser.role || currentUser.passwordLevel || "USER"}
            </div>
          </div>
        )}

        <div className="sidebar-menu">
          {/* ---------- 1. EMPLOYEE MASTER ---------- */}

          {hasRight("employee") && (
            <>
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
                  currentForm === "shiftMaster" ||
                  currentForm === "bankDetail" ||
                  currentForm === "qualification"
                    ? "menu-item active"
                    : "menu-item"
                }
                onClick={() => {
                  setEmployeeMenuOpen(!employeeMenuOpen);
                  setCurrentForm("employee");
                }}
              >
                <Users size={19} />

                <div className="menu-text">
                  <strong>1. Employee Master</strong>
                  <small>Employee details</small>
                </div>

                <div className="menu-arrow">
                  {employeeMenuOpen ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </div>
              </button>

              {employeeMenuOpen && (
                <div className="submenu">
                  <button
                    type="button"
                    className={
                      currentForm === "employee"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("employee", "employee")}
                  >
                    <Users size={16} />
                    <span>Employee List</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "employeeReport"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("employeeReport", "employee")}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Employee Report</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "excelUpload"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("excelUpload", "employee")}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Excel / CSV Upload</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "unitMaster" ||
                      currentForm === "departmentMaster" ||
                      currentForm === "contractorMaster" ||
                      currentForm === "designationMaster" ||
                      currentForm === "shiftMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => setMasterMenuOpen(!masterMenuOpen)}
                  >
                    <Building2 size={16} />

                    <span>Master Data</span>

                    {masterMenuOpen ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </button>

                  {masterMenuOpen && (
                    <div className="submenu">
                      <button
                        type="button"
                        className={
                          currentForm === "unitMaster"
                            ? "submenu-item active-submenu"
                            : "submenu-item"
                        }
                        onClick={() => openMaster("unitMaster")}
                      >
                        <Building2 size={15} />
                        <span>Unit Master</span>
                      </button>

                      <button
                        type="button"
                        className={
                          currentForm === "departmentMaster"
                            ? "submenu-item active-submenu"
                            : "submenu-item"
                        }
                        onClick={() => openMaster("departmentMaster")}
                      >
                        <Building2 size={15} />
                        <span>Department Master</span>
                      </button>

                      <button
                        type="button"
                        className={
                          currentForm === "contractorMaster"
                            ? "submenu-item active-submenu"
                            : "submenu-item"
                        }
                        onClick={() => openMaster("contractorMaster")}
                      >
                        <Users size={15} />
                        <span>Contractor Master</span>
                      </button>

                      <button
                        type="button"
                        className={
                          currentForm === "designationMaster"
                            ? "submenu-item active-submenu"
                            : "submenu-item"
                        }
                        onClick={() => openMaster("designationMaster")}
                      >
                        <BriefcaseBusiness size={15} />
                        <span>Designation Master</span>
                      </button>

                      <button
                        type="button"
                        className={
                          currentForm === "shiftMaster"
                            ? "submenu-item active-submenu"
                            : "submenu-item"
                        }
                        onClick={() => openMaster("shiftMaster")}
                      >
                        <CalendarCheck size={15} />
                        <span>Shift Master</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ---------- 2. ATTENDANCE ---------- */}

          {hasRight("attendance") && (
            <button
              type="button"
              className={
                currentForm === "attendance" ? "menu-item active" : "menu-item"
              }
              onClick={() => openForm("attendance", "attendance")}
            >
              <CalendarCheck size={19} />

              <div className="menu-text">
                <strong>2. Attendance</strong>
                <small>Attendance records</small>
              </div>
            </button>
          )}

          {/* ---------- 3. PF / ESI / SALARY ---------- */}

          {hasRight("salary") && (
            <>
              <button
                type="button"
                className={
                  currentForm === "pfesi" ||
                  currentForm === "salaryUpload" ||
                  currentForm === "salaryStatement"
                    ? "menu-item active"
                    : "menu-item"
                }
                onClick={() => {
                  setSalaryMenuOpen(!salaryMenuOpen);
                  setCurrentForm("pfesi");
                }}
              >
                <WalletCards size={19} />

                <div className="menu-text">
                  <strong>3. PF / ESI / Salary</strong>
                  <small>Salary details</small>
                </div>

                <div className="menu-arrow">
                  {salaryMenuOpen ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </div>
              </button>

              {salaryMenuOpen && (
                <div className="submenu">
                  <button
                    type="button"
                    className={
                      currentForm === "pfesi"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("pfesi", "salary")}
                  >
                    <WalletCards size={16} />
                    <span>PF / ESI Details</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "salaryUpload"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("salaryUpload", "salary")}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Salary Upload</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "salaryStatement"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("salaryStatement", "salary")}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Salary Statement</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* ---------- 4. SECURITY ---------- */}

          {hasRight("security") && (
            <>
              <button
                type="button"
                className={
                  currentForm === "userMaster" || currentForm === "userRights"
                    ? "menu-item active"
                    : "menu-item"
                }
                onClick={() => {
                  setSecurityMenuOpen(!securityMenuOpen);
                  setCurrentForm("userMaster");
                }}
              >
                <ShieldCheck size={19} />

                <div className="menu-text">
                  <strong>4. Security</strong>
                  <small>Security management</small>
                </div>

                <div className="menu-arrow">
                  {securityMenuOpen ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronRight size={17} />
                  )}
                </div>
              </button>

              {securityMenuOpen && (
                <div className="submenu">
                  <button
                    type="button"
                    className={
                      currentForm === "userMaster"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("userMaster", "security")}
                  >
                    <Users size={16} />
                    <span>User Master</span>
                  </button>

                  <button
                    type="button"
                    className={
                      currentForm === "userRights"
                        ? "submenu-item active-submenu"
                        : "submenu-item"
                    }
                    onClick={() => openForm("userRights", "security")}
                  >
                    <ShieldCheck size={16} />
                    <span>User Rights</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* LOGOUT */}

        <div className="sidebar-bottom">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="main-content">
        {!hasAnyMenu && (
          <div
            style={{
              padding: "40px",
              fontSize: "17px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            No menu rights assigned to this user. Please contact the
            administrator, then logout and login again.
          </div>
        )}

        {currentForm === "employee" && hasRight("employee") && (
          <EmployeeMaster
            onBankDetail={() => setCurrentForm("bankDetail")}
            onQualification={() => setCurrentForm("qualification")}
            onEmployeeSelect={handleEmployeeSelect}
          />
        )}

        {currentForm === "employeeReport" && hasRight("employee") && (
          <EmployeeReport
            onEmployeeInformation={() => setCurrentForm("employee")}
          />
        )}

        {currentForm === "bankDetail" && hasRight("employee") && (
          <BankDetail
            onEmployeeInformation={() => setCurrentForm("employee")}
            onQualification={() => setCurrentForm("qualification")}
          />
        )}

        {currentForm === "qualification" && hasRight("employee") && (
          <Qualification
            selectedEmployeeCode={selectedEmployeeCode}
            onEmployeeInformation={() => setCurrentForm("employee")}
            onBankDetail={() => setCurrentForm("bankDetail")}
          />
        )}

        {currentForm === "excelUpload" && hasRight("employee") && (
          <ExcelUpload />
        )}

        {currentForm === "unitMaster" && hasRight("employee") && <UnitMaster />}

        {currentForm === "departmentMaster" && hasRight("employee") && (
          <DepartmentMaster />
        )}

        {currentForm === "contractorMaster" && hasRight("employee") && (
          <ContractorMaster />
        )}

        {currentForm === "designationMaster" && hasRight("employee") && (
          <DesignationMaster />
        )}

        {currentForm === "shiftMaster" && hasRight("employee") && (
          <ShiftMaster />
        )}

        {currentForm === "attendance" && hasRight("attendance") && (
          <Attendance />
        )}

        {currentForm === "pfesi" && hasRight("salary") && <PFESI />}

        {currentForm === "salaryUpload" && hasRight("salary") && (
          <SalaryUpload />
        )}

        {currentForm === "salaryStatement" && hasRight("salary") && (
          <SalaryStatement />
        )}

        {currentForm === "userMaster" && hasRight("security") && <UserMaster />}

        {currentForm === "userRights" && hasRight("security") && <UserRights />}
      </main>
    </div>
  );
}

export default App;