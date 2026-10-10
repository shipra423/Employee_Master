import { useEffect, useState } from "react";
import axios from "axios";

import {
  Building2,
  Search,
  Plus,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  
  Edit3,
} from "lucide-react";

function DepartmentMaster() {
  const API_URL = "http://localhost:5000/api/departments";

  const emptyForm = {
    departmentCode: "",
    departmentName: "",
    departmentType: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState(emptyForm);

  const [departments, setDepartments] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // Form initially OPEN
  const [showForm, setShowForm] = useState(true);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // FETCH DEPARTMENTS
  // =====================================================

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      if (Array.isArray(response.data)) {
        setDepartments(response.data);
      } else if (Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.error("Fetch departments error:", err);

      setError("Failed to load department data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const handleClear = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  // =====================================================
  // ADD DEPARTMENT
  // =====================================================

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);

    setMessage("");
    setError("");

    setShowForm(true);
  };

  // =====================================================
  // EDIT / SELECT RECORD
  // =====================================================

  const handleEdit = (department) => {
    setFormData({
      departmentCode: department.departmentCode || "",
      departmentName: department.departmentName || "",
      departmentType: department.departmentType || "",
    });

    setEditingId(department._id);

    setMessage("");
    setError("");

    // Open form
    setShowForm(true);

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!formData.departmentCode.trim()) {
      setError("Department Code is required.");
      return;
    }

    if (!formData.departmentName.trim()) {
      setError("Department Name is required.");
      return;
    }

    if (!formData.departmentType.trim()) {
      setError("Department Type is required.");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // UPDATE
      // =================================================

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          formData
        );

        console.log("Department updated:", response.data);

        setMessage("Department updated successfully!");
      }

      // =================================================
      // ADD NEW
      // =================================================

      else {
        const response = await axios.post(
          API_URL,
          formData
        );

        console.log("Department saved:", response.data);

        setMessage("Department saved successfully!");
      }

      // Refresh records
      await fetchDepartments();

      // Clear form
      setFormData(emptyForm);
      setEditingId(null);

      // IMPORTANT:
      // Save/update ke baad form hide
      setShowForm(false);
    } catch (err) {
      console.error("Save/update department error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          editingId
            ? "Failed to update department."
            : "Failed to save department."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  
  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDepartments = departments.filter(
    (department) => {
      const search = searchText
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      return (
        String(department.departmentCode || "")
          .toLowerCase()
          .includes(search) ||
        String(department.departmentName || "")
          .toLowerCase()
          .includes(search) ||
        String(department.departmentType || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="employee-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>
          <h1>Department Master</h1>

          <p>
            Manage department master information
          </p>
        </div>

        <div className="form-badge">
          Master Data
        </div>

      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="employee-toolbar">

        {/* SEARCH */}

        <div className="employee-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search department..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

          {searchText && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() =>
                setSearchText("")
              }
            >
              <X size={16} />
            </button>
          )}

        </div>

        {/* ADD */}

        <button
          type="button"
          className="add-employee-btn"
          onClick={handleAdd}
        >
          <Plus size={18} />

          Add Department
        </button>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">

          <AlertCircle size={17} />

          {error}

        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      {showForm && (
        <form
          className="form-card"
          onSubmit={handleSubmit}
        >

          {/* SECTION TITLE */}

          <div className="section-title">

            <Building2 size={21} />

            <div>

              <h2>
                {editingId
                  ? "Edit Department"
                  : "Department Details"}
              </h2>

              <p>
                {editingId
                  ? "Update department information"
                  : "Enter department information"}
              </p>

            </div>

          </div>

          {/* FORM GRID */}

          <div className="form-grid">

            {/* DEPARTMENT CODE */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Department Code

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="departmentCode"
                value={
                  formData.departmentCode
                }
                onChange={handleChange}
                placeholder="Enter department code"
              />

            </div>

            {/* DEPARTMENT NAME */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Department Name

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="departmentName"
                value={
                  formData.departmentName
                }
                onChange={handleChange}
                placeholder="Enter department name"
              />

            </div>

            {/* DEPARTMENT TYPE */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Department Type

                <span className="required-star">
                  *
                </span>

              </label>

              <select
                name="departmentType"
                value={
                  formData.departmentType
                }
                onChange={handleChange}
              >

                <option value="">
                  Select department type
                </option>

                <option value="Production">
                  Production
                </option>

                <option value="Quality">
                  Quality
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

                <option value="Packing">
                  Packing
                </option>

                <option value="Administration">
                  Administration
                </option>

                <option value="HR">
                  HR
                </option>

                <option value="Accounts">
                  Accounts
                </option>

                <option value="Stores">
                  Stores
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              FORM ACTIONS
          ================================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              disabled={saving}
            >

              <RotateCcw size={17} />

              Clear

            </button>

            <button
              type="submit"
              className="next-btn"
              disabled={saving}
            >

              <Save size={17} />

              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update Department"
                : "Save Department"}

            </button>

          </div>

        </form>
      )}

      {/* =================================================
          DEPARTMENT RECORDS
          YE HAMESHA NICHE DIKHENGE
      ================================================= */}

      <div className="form-card">

        <div className="section-title">

          <Building2 size={21} />

          <div>

            <h2>
              Department Records
            </h2>

            <p>
              Saved department information
            </p>

          </div>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="table-message">
            Loading departments...
          </div>

        ) : filteredDepartments.length === 0 ? (

          <div className="table-message">
            {searchText
              ? "No department records found."
              : "No department records available."}
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Department Code
                  </th>

                  <th>
                    Department Name
                  </th>

                  <th>
                    Department Type
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredDepartments.map(
                  (department) => (

                    <tr
                      key={department._id}
                      onClick={() =>
                        handleEdit(department)
                      }
                      style={{
                        cursor: "pointer",
                      }}
                      title="Click to edit"
                    >

                      <td>
                        {department.departmentCode}
                      </td>

                      <td>
                        {department.departmentName}
                      </td>

                      <td>
                        {department.departmentType}
                      </td>

                      <td>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(department);
                          }}
                          title="Edit"
                        >

                          <Edit3 size={16} />

                        </button>

                        {/* DELETE */}

                        
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default DepartmentMaster;