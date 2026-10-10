import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Plus,
  Edit,
  
  Save,
  RotateCcw,
  UserRound,
  Building2,
  KeyRound,
  CalendarDays,
  Users,
  Search,
  X,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import "../../styles/UserMaster.css";

const API_URL = "http://localhost:5000/api/users";

const UNITS_API_URL = "http://localhost:5000/api/units";

const EMPLOYEES_API_URL =
  "http://localhost:5000/api/users/employees";

const initialForm = {
  unit: "",
  empId: "",
  userId: "",
  userName: "",
  password: "",
  confirmPassword: "",
  validFrom: "",
  validTo: "",
  valid: "YES",
  pwdChangeDays: "",
  passwordLevel: "USER",
};

function UserMaster() {
  // =====================================================
  // STATE
  // =====================================================

  const [users, setUsers] = useState([]);

  const [units, setUnits] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] =
    useState(initialForm);

  const [showForm, setShowForm] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [visiblePasswords, setVisiblePasswords] =
    useState({});

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  /*
    IMPORTANT:
    Login ke time tumhare project mein jo admin/user
    role localStorage mein save hota hai uske according
    ye values check hongi.

    Example:
    localStorage.setItem("passwordLevel", "ADMIN");

    Ya:
    localStorage.setItem("userRole", "ADMIN");
  */

  const getLoggedInRole = () => {
    const role =
      localStorage.getItem("passwordLevel") ||
      localStorage.getItem("userRole") ||
      localStorage.getItem("role") ||
      localStorage.getItem("userType") ||
      "";

    return String(role).trim().toUpperCase();
  };

  const isAdmin =
    getLoggedInRole() === "ADMIN";

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(API_URL);

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load users."
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD USERS ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD UNITS
  // =====================================================

  const loadUnits = async () => {
    try {
      const response =
        await fetch(
          UNITS_API_URL
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load units."
        );
      }

      setUnits(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "LOAD UNITS ERROR:",
        err
      );

      setUnits([]);
    }
  };

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  const loadEmployees = async () => {
    try {
      const response =
        await fetch(
          EMPLOYEES_API_URL
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load employees."
        );
      }

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );

      console.log(
        "Employees:",
        data
      );
    } catch (err) {
      console.error(
        "LOAD EMPLOYEES ERROR:",
        err
      );

      setEmployees([]);

      setError(
        err.message ||
          "Failed to load Employee Master."
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers();
    loadUnits();
    loadEmployees();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // EMPLOYEE SELECT
  // =====================================================

  const handleEmployeeChange = (e) => {
    const employeeCode =
      e.target.value.trim();

    const selectedEmployee =
      employees.find(
        (employee) =>
          String(
            employee.employeeCode || ""
          ).trim() ===
          employeeCode
      );

    if (!selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        empId: "",
        userName: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,

      empId:
        selectedEmployee.employeeCode,

      userName:
        selectedEmployee.employeeName ||
        "",
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  const validatePassword = (
    password
  ) => {
    return (
      password.length >= 5 &&
      /[A-Za-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*~]/.test(password)
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      ...initialForm,
    });

    setEditId(null);

    setShowPassword(false);

    setShowConfirmPassword(false);

    setError("");

    setSuccess("");
  };

  // =====================================================
  // ADD USER
  // =====================================================

  const handleAddUser = async () => {
    resetForm();

    setShowForm(true);

    await loadEmployees();
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    resetForm();

    setShowForm(false);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // REQUIRED
    // -------------------------------------------------

    if (!formData.unit.trim()) {
      setError(
        "Unit is required."
      );
      return;
    }

    if (!formData.empId.trim()) {
      setError(
        "Employee ID is required."
      );
      return;
    }

    if (
      !editId &&
      !formData.password
    ) {
      setError(
        "Password is required."
      );
      return;
    }

    if (
      !editId &&
      !formData.confirmPassword
    ) {
      setError(
        "Confirm Password is required."
      );
      return;
    }

    if (!formData.validFrom) {
      setError(
        "Valid From date is required."
      );
      return;
    }

    if (!formData.validTo) {
      setError(
        "Valid To date is required."
      );
      return;
    }

    if (
      formData.validFrom >
      formData.validTo
    ) {
      setError(
        "Valid To cannot be before Valid From."
      );
      return;
    }

    // -------------------------------------------------
    // PASSWORD
    // -------------------------------------------------

    if (
      formData.password ||
      formData.confirmPassword
    ) {
      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError(
          "Password and Confirm Password do not match."
        );
        return;
      }

      if (
        !validatePassword(
          formData.password
        )
      ) {
        setError(
          "Password must contain at least 5 characters, a letter, a number and a special character."
        );
        return;
      }
    }

    // -------------------------------------------------
    // SAVE
    // -------------------------------------------------

    try {
      setLoading(true);

      const userData = {
        unit:
          formData.unit.trim(),

        empId:
          formData.empId.trim(),

        userName:
          formData.userName.trim(),

        validFrom:
          formData.validFrom,

        validTo:
          formData.validTo,

        valid:
          formData.valid || "YES",

        pwdChangeDays:
          formData.pwdChangeDays === ""
            ? 0
            : Number(
                formData.pwdChangeDays
              ),

        passwordLevel:
          formData.passwordLevel ||
          "USER",
      };

      // Password only if entered
      if (formData.password) {
        userData.password =
          formData.password;
      }

      const url = editId
        ? `${API_URL}/${editId}`
        : API_URL;

      const method = editId
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            userData
          ),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save user."
        );
      }

      setSuccess(
        editId
          ? "User updated successfully."
          : `User ${
              data.user?.userId || ""
            } created successfully.`
      );

      await loadUsers();

      await loadEmployees();

      resetForm();

      setTimeout(() => {
        setShowForm(false);

        setSuccess("");
      }, 1200);

    } catch (err) {
      console.error(
        "SAVE USER ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to save user."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (user) => {
    /*
      Backend se password aa raha hai to yahan
      existing password fill ho jayega.

      Agar backend password nahi bhej raha:
      formData.password blank rahega.
    */

    const existingPassword =
      user.password || "";

    setFormData({
      unit:
        user.unit || "",

      empId:
        user.empId || "",

      userId:
        user.userId || "",

      userName:
        user.userName || "",

      password:
        existingPassword,

      confirmPassword:
        existingPassword,

      validFrom:
        user.validFrom
          ? String(
              user.validFrom
            ).substring(0, 10)
          : "",

      validTo:
        user.validTo
          ? String(
              user.validTo
            ).substring(0, 10)
          : "",

      valid:
        user.valid || "YES",

      pwdChangeDays:
        user.pwdChangeDays ??
        "",

      passwordLevel:
        user.passwordLevel ||
        "USER",
    });

    setEditId(user._id);

    setShowPassword(false);

    setShowConfirmPassword(false);

    setShowForm(true);

    setError("");

    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

 
  // =====================================================
  // PASSWORD VISIBILITY IN TABLE
  // =====================================================

  const toggleTablePassword = (
    userId
  ) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]:
        !prev[userId],
    }));
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const filteredUsers =
    users.filter((user) => {
      if (!searchValue) {
        return true;
      }

      return (
        String(
          user.userId || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          user.userName || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          user.empId || ""
        )
          .toLowerCase()
          .includes(searchValue) ||

        String(
          user.unit || ""
        )
          .toLowerCase()
          .includes(searchValue)
      );
    });

  // =====================================================
  // UNIT VALUE
  // =====================================================

  const getUnitValue = (unit) => {
    return (
      unit.unitCode ||
      unit.code ||
      unit.name ||
      ""
    );
  };

  // =====================================================
  // FORMAT PASSWORD
  // =====================================================

  const getPasswordDisplay = (
    user
  ) => {
    if (!isAdmin) {
      return "********";
    }

    if (!user.password) {
      return "Not available";
    }

    if (
      visiblePasswords[user._id]
    ) {
      return user.password;
    }

    return "********";
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="user-master-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="user-master-header">

        <div className="user-master-title">

          <div className="user-master-title-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h1>User Master</h1>

            <p>
              Manage system users and security access
            </p>
          </div>

        </div>

        {!showForm && (
          <button
            type="button"
            className="user-master-add-btn"
            onClick={handleAddUser}
          >
            <Plus size={17} />

            Add User
          </button>
        )}

      </div>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="user-master-success">
          {success}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !showForm && (
        <div className="user-master-error">

          <AlertCircle size={17} />

          {error}

        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (
        <div className="user-master-content">

          <div className="user-master-card">

            <div className="user-master-card-header">

              <div className="user-master-card-title">

                <UserRound size={19} />

                <h2>
                  {editId
                    ? "Edit User"
                    : "Add New User"}
                </h2>

              </div>

              <button
                type="button"
                className="user-master-close-btn"
                onClick={handleClose}
              >
                <X size={17} />
              </button>

            </div>

            {error && (
              <div className="user-master-error">

                <AlertCircle size={17} />

                {error}

              </div>
            )}

            <form
              className="user-master-form"
              onSubmit={handleSubmit}
            >

              <div className="user-master-form-grid">

                {/* =================================================
                    UNIT
                ================================================= */}

                <div className="user-master-form-group">

                  <label>
                    <Building2 size={15} />

                    Unit

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Unit
                    </option>

                    {units.map((unit) => {

                      const value =
                        getUnitValue(unit);

                      return (
                        <option
                          key={
                            unit._id ||
                            value
                          }
                          value={value}
                        >
                          {unit.unitName
                            ? `${value} - ${unit.unitName}`
                            : value}
                        </option>
                      );
                    })}

                  </select>

                </div>

                {/* =================================================
                    EMPLOYEE ID
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <UserRound size={15} />

                    Employee ID

                    <span className="required-star">
                      *
                    </span>

                  </label>

                  <select
                    name="empId"
                    value={formData.empId}
                    onChange={
                      handleEmployeeChange
                    }
                  >

                    <option value="">
                      Select Employee
                    </option>

                    {employees.map(
                      (employee) => (

                        <option
                          key={
                            employee._id ||
                            employee.employeeCode
                          }
                          value={
                            employee.employeeCode
                          }
                        >

                          {
                            employee.employeeCode
                          }

                          {employee.employeeName
                            ? ` - ${employee.employeeName}`
                            : ""}

                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* =================================================
                    USER ID
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <Users size={15} />

                    User ID

                  </label>

                  <input
                    type="text"
                    value={
                      formData.userId
                    }
                    readOnly
                    placeholder="Auto generated"
                  />

                </div>

                {/* =================================================
                    USER NAME
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <UserRound size={15} />

                    User Name

                  </label>

                 <input
               
  type="text"
  name="userName"
  value={formData.userName}
  onChange={handleChange}
  placeholder="Enter User Name"
  autoComplete="off"
     />
   

                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <KeyRound size={15} />

                    Password

                    <span className="required-star">
                      *
                    </span>

                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        editId
                          ? "Existing password / enter new password"
                          : "Enter Password"
                      }
                      autoComplete="new-password"
                      style={{
                        paddingRight:
                          "42px",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        right:
                          "10px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        padding:
                          "4px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                      }}
                    >

                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}

                    </button>

                  </div>

                  {editId &&
                    !formData.password && (
                      <small
                        style={{
                          color:
                            "#777",
                          marginTop:
                            "5px",
                        }}
                      >
                        Existing password was not returned by
                        the server.
                      </small>
                    )}

                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <KeyRound size={15} />

                    Confirm Password

                    <span className="required-star">
                      *
                    </span>

                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Re-enter Password"
                      autoComplete="new-password"
                      style={{
                        paddingRight:
                          "42px",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        right:
                          "10px",
                        top:
                          "50%",
                        transform:
                          "translateY(-50%)",
                        border:
                          "none",
                        background:
                          "transparent",
                        cursor:
                          "pointer",
                        padding:
                          "4px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                      }}
                    >

                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}

                    </button>

                  </div>

                </div>

                {/* =================================================
                    VALID FROM
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <CalendarDays size={15} />

                    Valid From

                    <span className="required-star">
                      *
                    </span>

                  </label>

                  <input
                    type="date"
                    name="validFrom"
                    value={
                      formData.validFrom
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* =================================================
                    VALID TO
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <CalendarDays size={15} />

                    Valid To

                    <span className="required-star">
                      *
                    </span>

                  </label>

                  <input
                    type="date"
                    name="validTo"
                    value={
                      formData.validTo
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

                {/* =================================================
                    VALID
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <ShieldCheck size={15} />

                    Valid

                  </label>

                  <select
                    name="valid"
                    value={
                      formData.valid
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="YES">
                      YES
                    </option>

                    <option value="NO">
                      NO
                    </option>

                  </select>

                </div>

                {/* =================================================
                    PASSWORD CHANGE DAYS
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <KeyRound size={15} />

                    Pwd Change Days

                  </label>

                  <input
                    type="number"
                    name="pwdChangeDays"
                    min="0"
                    value={
                      formData.pwdChangeDays
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter days"
                  />

                </div>

                {/* =================================================
                    PASSWORD LEVEL
                ================================================= */}

                <div className="user-master-form-group">

                  <label>

                    <KeyRound size={15} />

                    Password Level

                  </label>

                  <select
                    name="passwordLevel"
                    value={
                      formData.passwordLevel
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="USER">
                      User
                    </option>

                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="VIEWER">
                      Viewer
                    </option>

                  </select>

                </div>

              </div>

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="user-master-form-actions">

                <button
                  type="button"
                  className="user-master-clear-btn"
                  onClick={
                    resetForm
                  }
                  disabled={
                    loading
                  }
                >

                  <RotateCcw
                    size={16}
                  />

                  Reset

                </button>

                <button
                  type="button"
                  className="user-master-clear-btn"
                  onClick={
                    handleClose
                  }
                  disabled={
                    loading
                  }
                >

                  <X size={16} />

                  Cancel

                </button>

                <button
                  type="submit"
                  className="user-master-save-btn"
                  disabled={
                    loading
                  }
                >

                  <Save size={16} />

                  {loading
                    ? "Saving..."
                    : editId
                    ? "Update User"
                    : "Save User"}

                </button>

              </div>

            </form>

          </div>

          {/* =================================================
              PASSWORD NOTE
          ================================================= */}

          <div className="user-master-note">

            <div className="user-master-note-header">

              <FileText size={18} />

              <h3>
                Password Note
              </h3>

            </div>

            <div className="user-master-note-body">

              <p>
                Password should contain:
              </p>

              <ul>

                <li>
                  At least one letter
                </li>

                <li>
                  At least one number
                </li>

                <li>
                  At least one special character
                </li>

                <li>
                  Minimum 5 characters
                </li>

              </ul>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          USER LIST
      ================================================= */}

      {!showForm && (
        <div className="user-master-card">

          <div className="user-master-card-header">

            <div className="user-master-card-title">

              <Users size={19} />

              <h2>
                User List
              </h2>

            </div>

          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="user-master-toolbar">

            <div className="user-master-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search User ID / Name / Employee ID..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              {search && (
                <button
                  type="button"
                  className="user-master-search-clear"
                  onClick={() =>
                    setSearch("")
                  }
                >

                  <X size={15} />

                </button>
              )}

            </div>

            <strong>
              {loading
                ? "Loading..."
                : `${users.length} user(s)`}
            </strong>

          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          {filteredUsers.length >
          0 ? (

            <div className="user-master-table-wrapper">

              <table className="user-master-table">

                <thead>

                  <tr>

                    <th>
                      User ID
                    </th>

                    <th>
                      Unit
                    </th>

                    <th>
                      Employee ID
                    </th>

                    <th>
                      User Name
                    </th>

                    {/* PASSWORD */}

                    <th>
                      Password
                    </th>

                    <th>
                      Valid From
                    </th>

                    <th>
                      Valid To
                    </th>

                    <th>
                      Valid
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.map(
                    (user) => (

                      <tr
                        key={
                          user._id
                        }
                      >

                        {/* USER ID */}

                        <td>

                          <strong>
                            {
                              user.userId
                            }
                          </strong>

                        </td>

                        {/* UNIT */}

                        <td>
                          {
                            user.unit
                          }
                        </td>

                        {/* EMPLOYEE ID */}

                        <td>

                          <strong>
                            {
                              user.empId
                            }
                          </strong>

                        </td>

                        {/* USER NAME */}

                        <td>
                          {
                            user.userName
                          }
                        </td>

                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <td>

                          {isAdmin ? (

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "7px",
                                minWidth:
                                  "130px",
                              }}
                            >

                              <span
                                style={{
                                  fontFamily:
                                    visiblePasswords[
                                      user._id
                                    ]
                                      ? "inherit"
                                      : "monospace",
                                  wordBreak:
                                    "break-all",
                                }}
                              >
                                {
                                  getPasswordDisplay(
                                    user
                                  )
                                }
                              </span>

                              {user.password && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleTablePassword(
                                      user._id
                                    )
                                  }
                                  title={
                                    visiblePasswords[
                                      user._id
                                    ]
                                      ? "Hide password"
                                      : "Show password"
                                  }
                                  style={{
                                    border:
                                      "none",
                                    background:
                                      "transparent",
                                    cursor:
                                      "pointer",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    padding:
                                      "3px",
                                  }}
                                >

                                  {visiblePasswords[
                                    user._id
                                  ] ? (
                                    <EyeOff
                                      size={
                                        16
                                      }
                                    />
                                  ) : (
                                    <Eye
                                      size={
                                        16
                                      }
                                    />
                                  )}

                                </button>
                              )}

                            </div>

                          ) : (

                            <strong>
                              ********
                            </strong>

                          )}

                        </td>

                        {/* VALID FROM */}

                        <td>

                          {user.validFrom
                            ? String(
                                user.validFrom
                              ).substring(
                                0,
                                10
                              )
                            : "-"}

                        </td>

                        {/* VALID TO */}

                        <td>

                          {user.validTo
                            ? String(
                                user.validTo
                              ).substring(
                                0,
                                10
                              )
                            : "-"}

                        </td>

                        {/* VALID */}

                        <td>

                          <span
                            className={
                              user.valid ===
                              "YES"
                                ? "user-master-status active"
                                : "user-master-status inactive"
                            }
                          >
                            {
                              user.valid
                            }
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="user-master-actions">

                            {/* EDIT */}

                            <button
                              type="button"
                              className="user-master-edit-btn"
                              onClick={() =>
                                handleEdit(
                                  user
                                )
                              }
                              disabled={
                                loading
                              }
                              title="Edit User"
                            >

                              <Edit
                                size={15}
                              />

                            </button>

                            {/* DELETE */}

                           

                            

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="user-master-empty">

              <UserRound size={40} />

              <div>

                {loading
                  ? "Loading users..."
                  : search
                  ? "No matching users found."
                  : "No users available."}

              </div>

            </div>

          )}

        </div>
      )}

    </div>
  );
}

export default UserMaster;