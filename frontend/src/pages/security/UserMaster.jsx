import { useState } from "react";

import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
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
  UserCog,
  TableProperties,
} from "lucide-react";

import "../../styles/UserMaster.css";

function UserMaster() {
  // =====================================================
  // FORM OPEN / CLOSE
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  // =====================================================
  // USER LIST
  // =====================================================

  const [users, setUsers] = useState([]);

  // =====================================================
  // EDIT MODE
  // =====================================================

  const [editIndex, setEditIndex] = useState(null);

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // SECURITY TAB
  // =====================================================

  const [activeSecurityTab, setActiveSecurityTab] =
    useState(null);

  // =====================================================
  // ROLE OPTIONS
  // =====================================================

  const roleOptions = [
    "NONE",
    "PURCHASE",
    "HR",
    "PRODUCTION",
    "ACCOUNT",
    "SALES",
    "MAIN STORE",
  ];

  // =====================================================
  // ROLE DATA
  // =====================================================

  const [roles, setRoles] = useState([
    {
      userRole: "",
      roleName: "",
    },
    {
      userRole: "",
      roleName: "",
    },
    {
      userRole: "",
      roleName: "",
    },
    {
      userRole: "",
      roleName: "",
    },
    {
      userRole: "",
      roleName: "",
    },
  ]);

  // =====================================================
  // UNIT AUTHORIZATION DATA
  // =====================================================

  const [authorizedUnits, setAuthorizedUnits] =
    useState([
      {
        unitCode: "",
        unitName: "",
      },
      {
        unitCode: "",
        unitName: "",
      },
      {
        unitCode: "",
        unitName: "",
      },
      {
        unitCode: "",
        unitName: "",
      },
      {
        unitCode: "",
        unitName: "",
      },
    ]);

  // =====================================================
  // FORM DATA
  // =====================================================

  const initialForm = {
    unit: "",
    userId: "",
    empId: "",
    userName: "",
    password: "",
    confirmPassword: "",
    validFrom: "",
    validTo: "",
    valid: "YES",
    msgBeforeDays: "",
    pwdChangeDays: "",
    passwordLevel: "",
  };

  const [formData, setFormData] =
    useState(initialForm);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // PASSWORD VALIDATION
  // =====================================================

  const validatePassword = (password) => {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*~]/.test(password);

    return (
      hasLetter &&
      hasNumber &&
      hasSpecial
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData(initialForm);
    setEditIndex(null);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    resetForm();
    setShowForm(false);
    setActiveSecurityTab(null);
  };

  // =====================================================
  // ADD / UPDATE USER
  // =====================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.unit ||
      !formData.userId ||
      !formData.empId ||
      !formData.userName ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.validFrom ||
      !formData.validTo
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

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
        "Password must contain a letter, number and special character."
      );
      return;
    }

    const duplicateUser = users.some(
      (user, index) =>
        user.userId.toLowerCase() ===
          formData.userId.toLowerCase() &&
        index !== editIndex
    );

    if (duplicateUser) {
      setError(
        "This User ID already exists."
      );
      return;
    }

    // =================================================
    // UPDATE USER
    // =================================================

    if (editIndex !== null) {
      const updatedUsers = [...users];

      updatedUsers[editIndex] = {
        ...formData,
      };

      setUsers(updatedUsers);

      setSuccess(
        "User updated successfully."
      );

      setEditIndex(null);
    }

    // =================================================
    // ADD USER
    // =================================================

    else {
      setUsers((prev) => [
        ...prev,
        {
          ...formData,
        },
      ]);

      setSuccess(
        "User added successfully."
      );
    }

    setFormData(initialForm);
  };

  // =====================================================
  // EDIT USER
  // =====================================================

  const handleEdit = (index) => {
    setFormData(users[index]);

    setEditIndex(index);

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDelete = (index) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmDelete) {
      return;
    }

    setUsers((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setSuccess(
      "User deleted successfully."
    );
  };

  // =====================================================
  // FILTER USERS
  // =====================================================

  const filteredUsers =
    users.filter((user) => {
      const text =
        search.toLowerCase();

      return (
        user.userId
          .toLowerCase()
          .includes(text) ||
        user.userName
          .toLowerCase()
          .includes(text) ||
        user.empId
          .toLowerCase()
          .includes(text)
      );
    });

  // =====================================================
  // ADD USER
  // =====================================================

  const handleAddUser = () => {
    resetForm();

    setShowForm(true);

    setActiveSecurityTab(null);
  };

  // =====================================================
  // ROLE CHANGE
  // =====================================================

  const handleRoleChange = (
    index,
    field,
    value
  ) => {
    setRoles((prev) =>
      prev.map((role, i) =>
        i === index
          ? {
              ...role,
              [field]: value,

              // Role Name automatically same
              // as selected User Role
              ...(field === "userRole"
                ? {
                    roleName: value,
                  }
                : {}),
            }
          : role
      )
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // UPDATE ROLE
  // =====================================================

  const updateRole = (index) => {
    const selectedRole =
      roles[index].userRole;

    if (!selectedRole) {
      setError(
        "Please select a role first."
      );

      setSuccess("");

      return;
    }

    setError("");

    setSuccess(
      `${selectedRole} role updated successfully.`
    );
  };

  // =====================================================
  // ADD ROLE ROW
  // =====================================================

  const addRoleRow = () => {
    setRoles((prev) => [
      ...prev,
      {
        userRole: "",
        roleName: "",
      },
    ]);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // REMOVE ROLE
  // =====================================================

  const removeRole = (index) => {
    setRoles((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );

    setError("");

    setSuccess(
      "Role removed successfully."
    );
  };

  // =====================================================
  // UNIT CHANGE
  // =====================================================

  const handleUnitChange = (
    index,
    field,
    value
  ) => {
    setAuthorizedUnits((prev) =>
      prev.map((unit, i) =>
        i === index
          ? {
              ...unit,
              [field]: value,
            }
          : unit
      )
    );

    setError("");
    setSuccess("");
  };

  // =====================================================
  // ADD UNIT ROW
  // =====================================================

  const addUnitRow = () => {
    setAuthorizedUnits((prev) => [
      ...prev,
      {
        unitCode: "",
        unitName: "",
      },
    ]);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // RENDER
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
            <h1>
              User Master
            </h1>
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
          ADD / EDIT USER FORM
      ================================================= */}

      {showForm && (

        <div className="user-master-content">

          {/* =================================================
              FORM CARD
          ================================================= */}

          <div className="user-master-card">

            <div className="user-master-card-header">

              <div className="user-master-card-title">

                <UserRound size={19} />

                <h2>
                  {editIndex !== null
                    ? "Edit User"
                    : "Add New User"}
                </h2>

              </div>

              <button
                type="button"
                className="user-master-close-btn"
                onClick={closeForm}
              >
                <X size={17} />
              </button>

            </div>


            {/* ERROR */}

            {error && (
              <div className="user-master-error">
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="user-master-success">
                {success}
              </div>
            )}


            {/* FORM */}

            <form
              className="user-master-form"
              onSubmit={handleSubmit}
            >

              <div className="user-master-form-grid">

                {/* UNIT */}

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

                    <option value="UNIT-01">
                      UNIT-01
                    </option>

                    <option value="UNIT-02">
                      UNIT-02
                    </option>

                    <option value="UNIT-03">
                      UNIT-03
                    </option>

                  </select>

                </div>


                {/* USER ID */}

                <div className="user-master-form-group">

                  <label>
                    <Users size={15} />

                    User ID

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Enter User ID"
                  />

                </div>


                {/* EMP ID */}

                <div className="user-master-form-group">

                  <label>
                    <UserRound size={15} />

                    Emp ID

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="empId"
                    value={formData.empId}
                    onChange={handleChange}
                    placeholder="Enter Employee ID"
                  />

                </div>


                {/* USER NAME */}

                <div className="user-master-form-group">

                  <label>
                    <UserRound size={15} />

                    User Name

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Enter User Name"
                  />

                </div>


                {/* PASSWORD */}

                <div className="user-master-form-group">

                  <label>
                    <KeyRound size={15} />

                    Password

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="user-master-form-group">

                  <label>
                    <KeyRound size={15} />

                    Confirm Password

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm Password"
                  />

                </div>


                {/* VALID FROM */}

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
                    onChange={handleChange}
                  />

                </div>


                {/* VALID TO */}

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
                    onChange={handleChange}
                  />

                </div>


                {/* VALID */}

                <div className="user-master-form-group">

                  <label>
                    <ShieldCheck size={15} />

                    Valid
                  </label>

                  <select
                    name="valid"
                    value={formData.valid}
                    onChange={handleChange}
                  >

                    <option value="YES">
                      YES
                    </option>

                    <option value="NO">
                      NO
                    </option>

                  </select>

                </div>


                {/* MSG BEFORE DAYS */}

                <div className="user-master-form-group">

                  <label>
                    <CalendarDays size={15} />

                    Msg Before Days
                  </label>

                  <input
                    type="number"
                    name="msgBeforeDays"
                    value={
                      formData.msgBeforeDays
                    }
                    onChange={handleChange}
                    placeholder="Enter days"
                    min="0"
                  />

                </div>


                {/* PWD CHANGE DAYS */}

                <div className="user-master-form-group">

                  <label>
                    <KeyRound size={15} />

                    Pwd Change Days
                  </label>

                  <input
                    type="number"
                    name="pwdChangeDays"
                    value={
                      formData.pwdChangeDays
                    }
                    onChange={handleChange}
                    placeholder="Enter days"
                    min="0"
                  />

                </div>


                {/* PASSWORD LEVEL */}

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
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Level
                    </option>

                    <option value="ADMIN">
                      Admin
                    </option>

                    <option value="USER">
                      User
                    </option>

                    <option value="VIEWER">
                      Viewer
                    </option>

                  </select>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="user-master-form-actions">

                <button
                  type="button"
                  className="user-master-clear-btn"
                  onClick={resetForm}
                >
                  <RotateCcw size={16} />
                  Reset
                </button>


                <button
                  type="button"
                  className="user-master-clear-btn"
                  onClick={closeForm}
                >
                  <X size={16} />
                  Cancel
                </button>


                <button
                  type="submit"
                  className="user-master-save-btn"
                >
                  <Save size={16} />

                  {editIndex !== null
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
                Your password should contain:
              </p>

              <ul>

                <li>
                  Characters like A, a, z, etc.
                </li>

                <li>
                  Special characters like
                  ! @ # $ % ^ & *
                </li>

                <li>
                  Numbers like 1, 2, 3, etc.
                </li>

              </ul>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          USER LIST
          ONLY FRONT PAGE
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


          {/* SEARCH */}

          <div className="user-master-toolbar">

            <div className="user-master-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search User ID..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
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
              Existing system users
            </strong>

          </div>


          {/* USER TABLE */}

          {filteredUsers.length > 0 ? (

            <div className="user-master-table-wrapper">

              <table className="user-master-table">

                <thead>

                  <tr>
                    <th>Unit</th>
                    <th>User ID</th>
                    <th>Emp ID</th>
                    <th>User Name</th>
                    <th>Valid From</th>
                    <th>Valid To</th>
                    <th>Valid</th>
                    <th>Actions</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredUsers.map(
                    (user, index) => (

                      <tr key={index}>

                        <td>
                          {user.unit}
                        </td>

                        <td>
                          <strong>
                            {user.userId}
                          </strong>
                        </td>

                        <td>
                          {user.empId}
                        </td>

                        <td>
                          {user.userName}
                        </td>

                        <td>
                          {user.validFrom}
                        </td>

                        <td>
                          {user.validTo}
                        </td>

                        <td>

                          <span
                            className={
                              user.valid === "YES"
                                ? "user-master-status active"
                                : "user-master-status inactive"
                            }
                          >
                            {user.valid}
                          </span>

                        </td>

                        <td>

                          <div className="user-master-actions">

                            <button
                              type="button"
                              className="user-master-edit-btn"
                              onClick={() =>
                                handleEdit(index)
                              }
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>


                            <button
                              type="button"
                              className="user-master-delete-btn"
                              onClick={() =>
                                handleDelete(index)
                              }
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>

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
                No users available.
              </div>

              <strong>
                Click "Add User" to create a user.
              </strong>

            </div>

          )}

        </div>

      )}


      {/* =================================================
          SECURITY SECTION
          ALWAYS BELOW FORM / USER LIST
      ================================================= */}

      <div className="security-section">

        {/* =================================================
            TABS
        ================================================= */}

        <div className="security-tabs">

          {/* ROLE DEFINE */}

          <button
            type="button"
            className={
              activeSecurityTab ===
              "roleDefine"
                ? "security-tab active"
                : "security-tab"
            }
            onClick={() =>
              setActiveSecurityTab(
                activeSecurityTab ===
                "roleDefine"
                  ? null
                  : "roleDefine"
              )
            }
          >

            <UserCog size={16} />

            Role Define

          </button>


          {/* UNIT AUTHORIZATION */}

          <button
            type="button"
            className={
              activeSecurityTab ===
              "unitAuthorization"
                ? "security-tab active"
                : "security-tab"
            }
            onClick={() =>
              setActiveSecurityTab(
                activeSecurityTab ===
                "unitAuthorization"
                  ? null
                  : "unitAuthorization"
              )
            }
          >

            <TableProperties size={16} />

            Unit Authorization

          </button>

        </div>


        {/* =================================================
            ROLE DEFINE
        ================================================= */}

        {activeSecurityTab ===
          "roleDefine" && (

          <div className="security-panel">

            <div className="security-panel-title">

              <UserCog size={18} />

              <strong>
                Assign User Role
              </strong>

            </div>


            <div className="role-table-box">

              <table className="security-data-table">

                <thead>

                  <tr>

                    <th>
                      User Role
                    </th>

                    <th>
                      Role Name
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {roles.map(
                    (role, index) => (

                      <tr key={index}>

                        {/* USER ROLE */}

                        <td>

                          <select
                            value={
                              role.userRole
                            }
                            onChange={(e) =>
                              handleRoleChange(
                                index,
                                "userRole",
                                e.target.value
                              )
                            }
                          >

                            <option value="">
                              Select Role
                            </option>

                            <option value="NONE">
                              None
                            </option>

                            <option value="PURCHASE">
                              Purchase
                            </option>

                            <option value="HR">
                              HR
                            </option>

                            <option value="PRODUCTION">
                              Production
                            </option>

                            <option value="ACCOUNT">
                              Account
                            </option>

                            <option value="SALES">
                              Sales
                            </option>

                            <option value="MAIN STORE">
                              Main Store
                            </option>

                          </select>

                        </td>


                        {/* ROLE NAME */}

                        <td>

                          <input
                            type="text"
                            value={
                              role.roleName
                            }
                            readOnly
                            placeholder="Role Name"
                          />

                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="role-action-buttons">

                            <button
                              type="button"
                              className="update-role-btn"
                              onClick={() =>
                                updateRole(index)
                              }
                            >
                              UPDATE ROLE
                            </button>


                            <button
                              type="button"
                              className="remove-role-btn"
                              onClick={() =>
                                removeRole(index)
                              }
                            >
                              Remove Role
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


              {/* ADD ROLE */}

              <button
                type="button"
                className="add-role-row-btn"
                onClick={addRoleRow}
              >

                <Plus size={15} />

                Add Role

              </button>

            </div>

          </div>

        )}


        {/* =================================================
            UNIT AUTHORIZATION
        ================================================= */}

        {activeSecurityTab ===
          "unitAuthorization" && (

          <div className="security-panel">

            <div className="security-panel-title">

              <Building2 size={18} />

              <strong>
                Assign Authorized Unit
              </strong>

            </div>


            <div className="unit-table-box">

              <table className="security-data-table">

                <thead>

                  <tr>

                    <th>
                      Unit Code
                    </th>

                    <th>
                      Unit Name
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {authorizedUnits.map(
                    (unit, index) => (

                      <tr key={index}>

                        {/* UNIT CODE */}

                        <td>

                          <input
                            type="text"
                            value={
                              unit.unitCode
                            }
                            onChange={(e) =>
                              handleUnitChange(
                                index,
                                "unitCode",
                                e.target.value
                              )
                            }
                            placeholder="Enter Unit Code"
                          />

                        </td>


                        {/* UNIT NAME */}

                        <td>

                          <input
                            type="text"
                            value={
                              unit.unitName
                            }
                            onChange={(e) =>
                              handleUnitChange(
                                index,
                                "unitName",
                                e.target.value
                              )
                            }
                            placeholder="Enter Unit Name"
                          />

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


              {/* ADD UNIT */}

              <button
                type="button"
                className="add-role-row-btn"
                onClick={addUnitRow}
              >

                <Plus size={15} />

                Add Unit

              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default UserMaster;