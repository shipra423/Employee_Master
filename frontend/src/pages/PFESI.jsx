
import { useEffect, useState } from "react";
import axios from "axios";

import {
  UserRound,
  Building2,
  IndianRupee,
  ShieldCheck,
  HeartPulse,
  CalendarDays,
  Save,
  RotateCcw,
  Search,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

function PFESI() {
  // =====================================================
  // API
  // =====================================================

  const API_URL =
    "http://localhost:5000/api/employees";

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    employeeCode: "",
    employeeName: "",
    department: "",
    basicSalary: "",
    pfNumber: "",
    pfApplicable: false,
    esiNumber: "",
    esiApplicable: false,
    effectiveDate: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  const [records, setRecords] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editMode, setEditMode] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // DEPARTMENT OPTIONS
  // =====================================================

  const departmentOptions = [
    "Packing",
    "Assembly",
    "Moulding",
    "Production",
    "Quality",
    "Maintenance",
    "Store",
    "HR",
    "Admin",
    "Other",
  ];

  // =====================================================
  // GET ALL RECORDS
  // =====================================================

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await axios.get(API_URL);

      setRecords(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch records error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load employee records."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchRecords();
  }, []);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (
      !formData.employeeCode.trim()
    ) {
      setError(
        "Please enter Employee Code."
      );
      return;
    }

    if (
      !formData.employeeName.trim()
    ) {
      setError(
        "Please enter Employee Name."
      );
      return;
    }

    if (!formData.department) {
      setError(
        "Please select Department."
      );
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // FORM 3 DATA
      // =================================================

      const saveData = {
        employeeCode:
          formData.employeeCode.trim(),

        employeeName:
          formData.employeeName.trim(),

        department:
          formData.department,

        basicSalary:
          Number(
            formData.basicSalary
          ) || 0,

        pfNumber:
          formData.pfNumber.trim(),

        pfApplicable:
          formData.pfApplicable,

        esiNumber:
          formData.esiNumber.trim(),

        esiApplicable:
          formData.esiApplicable,

        effectiveDate:
          formData.effectiveDate || null,
      };

      console.log(
        "Saving Form 3:",
        saveData
      );

      // =================================================
      // EDIT MODE
      // =================================================

      if (editMode && editId) {
        const response =
          await axios.put(
            `${API_URL}/${editId}`,
            {
              employeeCode:
                saveData.employeeCode,

              employeeName:
                saveData.employeeName,

              departmentCode:
                saveData.department,

              basicSalary:
                saveData.basicSalary,

              pfNumber:
                saveData.pfNumber,

              pfApplicable:
                saveData.pfApplicable,

              esiNumber:
                saveData.esiNumber,

              esiApplicable:
                saveData.esiApplicable,

              effectiveDate:
                saveData.effectiveDate,
            }
          );

        console.log(
          "Updated:",
          response.data
        );

        setMessage(
          "Employee details updated successfully."
        );
      } else {
        // =================================================
        // NORMAL SAVE
        // =================================================

        const response =
          await axios.post(
            `${API_URL}/form3`,
            saveData
          );

        console.log(
          "Saved:",
          response.data
        );

        setMessage(
          "Data saved successfully in database."
        );
      }

      // =================================================
      // REFRESH TABLE
      // =================================================

      await fetchRecords();

      // =================================================
      // RESET FORM
      // =================================================

      setFormData(emptyForm);

      setEditMode(false);
      setEditId(null);
    } catch (err) {
      console.error(
        "SAVE ERROR:",
        err
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Data save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData(emptyForm);

    setEditMode(false);
    setEditId(null);

    setMessage("");
    setError("");
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (record) => {
    setEditMode(true);

    setEditId(record._id);

    setFormData({
      employeeCode:
        record.employeeCode || "",

      employeeName:
        record.employeeName || "",

      department:
        record.departmentCode || "",

      basicSalary:
        record.basicSalary ?? "",

      pfNumber:
        record.pfNumber || "",

      pfApplicable:
        record.pfApplicable || false,

      esiNumber:
        record.esiNumber || "",

      esiApplicable:
        record.esiApplicable || false,

      effectiveDate:
        record.effectiveDate
          ? String(
              record.effectiveDate
            ).substring(0, 10)
          : "",
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setFormData(emptyForm);

    setMessage("");
    setError("");
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this employee?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      await axios.delete(
        `${API_URL}/${id}`
      );

      setMessage(
        "Employee deleted successfully."
      );

      await fetchRecords();
    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete employee."
      );
    }
  };

  // =====================================================
  // SEARCH TABLE
  // =====================================================

  const filteredRecords =
    records.filter((record) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          record.employeeCode || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          record.employeeName || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          record.departmentCode || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const year =
      date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="employee-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <h1>
            PF / ESI / Basic Details
          </h1>
        </div>

        <div className="form-badge">
          Form 3 of 3
        </div>

      </div>

      {/* STEP INDICATOR */}

      <div className="step-card">

        <div className="step">
          <span>1</span>

          <div>
            <strong>
              Employee Details
            </strong>

            <small>
              Basic information
            </small>
          </div>
        </div>

        <div className="step-line" />

        <div className="step">
          <span>2</span>

          <div>
            <strong>
              Attendance
            </strong>

            <small>
              Department wise
            </small>
          </div>
        </div>

        <div className="step-line" />

        <div className="step active">
          <span>3</span>

          <div>
            <strong>
              PF / ESI
            </strong>

            <small>
              Salary details
            </small>
          </div>
        </div>

      </div>

      {/* FORM */}

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        {/* EDIT MESSAGE */}

        {editMode && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              marginBottom: "20px",
              padding: "12px 15px",
              borderRadius: "8px",
              background:
                "#eff6ff",
              border:
                "1px solid #bfdbfe",
            }}
          >

            <strong
              style={{
                color: "#2563eb",
                fontSize: "14px",
              }}
            >
              Editing Employee:{" "}
              {formData.employeeCode}
            </strong>

            <button
              type="button"
              onClick={
                handleCancelEdit
              }
              style={{
                border: "none",
                background:
                  "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems:
                  "center",
                gap: "5px",
                color: "#dc2626",
                fontWeight: "700",
              }}
            >
              <X size={16} />

              Cancel Edit
            </button>

          </div>
        )}

        {/* TITLE */}

        <div className="section-title">

          <IndianRupee size={21} />

          <div>
            <h2>
              Employee PF / ESI Details
            </h2>
          </div>

        </div>

        {/* FORM GRID */}

        <div className="form-grid">

          {/* EMPLOYEE CODE */}

          <div className="form-group">

            <label>
              <UserRound size={17} />
              Employee Code
            </label>

            <input
              type="text"
              name="employeeCode"
              value={
                formData.employeeCode
              }
              onChange={
                handleChange
              }
              placeholder="Enter employee code"
              required
            />

          </div>

          {/* EMPLOYEE NAME */}

          <div className="form-group">

            <label>
              <UserRound size={17} />
              Employee Name
            </label>

            <input
              type="text"
              name="employeeName"
              value={
                formData.employeeName
              }
              onChange={
                handleChange
              }
              placeholder="Enter employee name"
              required
            />

          </div>

          {/* DEPARTMENT */}

          <div className="form-group">

            <label>
              <Building2 size={17} />
              Department
            </label>

            <select
              name="department"
              value={
                formData.department
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Select Department
              </option>

              {departmentOptions.map(
                (department) => (
                  <option
                    key={department}
                    value={department}
                  >
                    {department}
                  </option>
                )
              )}

            </select>

          </div>

          {/* BASIC SALARY */}

          <div className="form-group">

            <label>
              <IndianRupee size={17} />
              Basic Salary
            </label>

            <input
              type="number"
              name="basicSalary"
              value={
                formData.basicSalary
              }
              onChange={
                handleChange
              }
              placeholder="Enter basic salary"
              min="0"
            />

          </div>

          {/* PF NUMBER */}

          <div className="form-group">

            <label>
              <ShieldCheck size={17} />
              PF Number
            </label>

            <input
              type="text"
              name="pfNumber"
              value={
                formData.pfNumber
              }
              onChange={
                handleChange
              }
              placeholder="Enter PF number"
            />

          </div>

          {/* PF */}

          <div className="form-group">

            <label>
              <ShieldCheck size={17} />
              PF Applicable
            </label>

            <label className="checkbox-box">

              <input
                type="checkbox"
                name="pfApplicable"
                checked={
                  formData.pfApplicable
                }
                onChange={
                  handleChange
                }
              />

              <span>
                PF applicable
              </span>

            </label>

          </div>

          {/* ESI NUMBER */}

          <div className="form-group">

            <label>
              <HeartPulse size={17} />
              ESI Number
            </label>

            <input
              type="text"
              name="esiNumber"
              value={
                formData.esiNumber
              }
              onChange={
                handleChange
              }
              placeholder="Enter ESI number"
            />

          </div>

          {/* ESI */}

          <div className="form-group">

            <label>
              <HeartPulse size={17} />
              ESI Applicable
            </label>

            <label className="checkbox-box">

              <input
                type="checkbox"
                name="esiApplicable"
                checked={
                  formData.esiApplicable
                }
                onChange={
                  handleChange
                }
              />

              <span>
                ESI applicable
              </span>

            </label>

          </div>

          {/* EFFECTIVE DATE */}

          <div className="form-group">

            <label>
              <CalendarDays size={17} />
              Effective Date
            </label>

            <input
              type="date"
              name="effectiveDate"
              value={
                formData.effectiveDate
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>

        {/* BUTTONS */}

        <div className="form-actions">

          <button
            type="button"
            className="clear-btn"
            onClick={
              editMode
                ? handleCancelEdit
                : handleReset
            }
            disabled={saving}
          >

            {editMode ? (
              <X size={17} />
            ) : (
              <RotateCcw
                size={17}
              />
            )}

            {editMode
              ? "Cancel"
              : "Reset"}

          </button>

          <button
            type="submit"
            className="next-btn"
            disabled={saving}
          >

            <Save size={17} />

            {saving
              ? "Saving..."
              : editMode
              ? "Save Changes"
              : "Save Details"}

          </button>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </form>

      {/* RECORDS */}

      <div
        className="form-card"
        id="employee-records"
      >

        <div className="section-title">

          <Search size={21} />

          <div>
            <h2>
              Employee PF / ESI Records
            </h2>
          </div>

        </div>

        {/* SEARCH TABLE */}

        <div className="attendance-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search employee code, name or department..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* TABLE */}

        <div className="table-wrapper">

          {loading ? (

            <div className="table-message">
              Loading employee records...
            </div>

          ) : filteredRecords.length ===
            0 ? (

            <div className="table-message">
              No employee records found.
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Employee Code
                  </th>

                  <th>
                    Employee Name
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Basic Salary
                  </th>

                  <th>
                    PF Number
                  </th>

                  <th>
                    PF
                  </th>

                  <th>
                    ESI Number
                  </th>

                  <th>
                    ESI
                  </th>

                  <th>
                    Effective Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords.map(
                  (record) => (

                    <tr
                      key={
                        record._id
                      }
                    >

                      <td>
                        {
                          record.employeeCode ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          record.employeeName ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          record.departmentCode ||
                          "-"
                        }
                      </td>

                      <td>
                        ₹{" "}
                        {Number(
                          record.basicSalary ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {
                          record.pfNumber ||
                          "-"
                        }
                      </td>

                      <td>

                        {record.pfApplicable ? (

                          <span className="status-present">
                            YES
                          </span>

                        ) : (

                          <span className="status-absent">
                            NO
                          </span>

                        )}

                      </td>

                      <td>
                        {
                          record.esiNumber ||
                          "-"
                        }
                      </td>

                      <td>

                        {record.esiApplicable ? (

                          <span className="status-present">
                            YES
                          </span>

                        ) : (

                          <span className="status-absent">
                            NO
                          </span>

                        )}

                      </td>

                      <td>
                        {formatDate(
                          record.effectiveDate
                        )}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit Employee"
                          onClick={() =>
                            handleEdit(
                              record
                            )
                          }
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete Employee"
                          onClick={() =>
                            handleDelete(
                              record._id
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default PFESI;

