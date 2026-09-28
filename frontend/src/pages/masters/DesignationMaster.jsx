import { useEffect, useState } from "react";
import axios from "axios";

import {
  BriefcaseBusiness,
  Search,
  Plus,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";

function DesignationMaster() {
  const API_URL = "http://localhost:5000/api/designations";

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    designationCode: "",
    designationName: "",
    designationType: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState(emptyForm);

  const [designations, setDesignations] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form initially visible
  const [showForm, setShowForm] = useState(true);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // FETCH DESIGNATIONS
  // =====================================================

  const fetchDesignations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      if (Array.isArray(response.data)) {
        setDesignations(response.data);
      } else if (Array.isArray(response.data.designations)) {
        setDesignations(response.data.designations);
      } else {
        setDesignations([]);
      }
    } catch (err) {
      console.error("Fetch designations error:", err);

      setError("Failed to load designation data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDesignations();
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
    setMessage("");
    setError("");
    setEditingId(null);
  };

  // =====================================================
  // ADD DESIGNATION
  // =====================================================

  const handleAdd = () => {
    setFormData(emptyForm);
    setEditingId(null);

    setMessage("");
    setError("");
    setSearchText("");

    setShowForm(true);
  };

  // =====================================================
  // CLICK RECORD → LOAD INTO FORM
  // =====================================================

  const handleEdit = (designation) => {
    setFormData({
      designationCode: designation.designationCode || "",
      designationName: designation.designationName || "",
      designationType: designation.designationType || "",
    });

    setEditingId(designation._id);

    setMessage("");
    setError("");

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

    if (!formData.designationCode.trim()) {
      setError("Designation Code is required.");
      return;
    }

    if (!formData.designationName.trim()) {
      setError("Designation Name is required.");
      return;
    }

    if (!formData.designationType.trim()) {
      setError("Designation Type is required.");
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

        console.log("Designation updated:", response.data);

        setMessage("Designation updated successfully!");
      }

      // =================================================
      // NEW SAVE
      // =================================================

      else {
        const response = await axios.post(
          API_URL,
          formData
        );

        console.log("Designation saved:", response.data);

        setMessage("Designation saved successfully!");
      }

      // Clear form
      setFormData(emptyForm);
      setEditingId(null);

      // Refresh records
      await fetchDesignations();

      // Hide form after save/update
      setShowForm(false);

    } catch (err) {
      console.error(
        "Save/update designation error:",
        err
      );

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          editingId
            ? "Failed to update designation."
            : "Failed to save designation."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this designation?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await axios.delete(`${API_URL}/${id}`);

      setMessage(
        "Designation deleted successfully!"
      );

      // If deleted record was being edited
      if (editingId === id) {
        setFormData(emptyForm);
        setEditingId(null);
      }

      await fetchDesignations();

    } catch (err) {
      console.error(
        "Delete designation error:",
        err
      );

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "Failed to delete designation."
        );
      }
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDesignations = designations.filter(
    (designation) => {
      const search = searchText
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      return (
        String(
          designation.designationCode || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          designation.designationName || ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          designation.designationType || ""
        )
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
          <h1>Designation Master</h1>
          <p>
            Manage designation information
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
            placeholder="Search designation..."
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

        {!showForm && (
          <button
            type="button"
            className="add-employee-btn"
            onClick={handleAdd}
          >
            <Plus size={18} />
            Add Designation
          </button>
        )}

      </div>

      {/* =================================================
          SUCCESS / ERROR
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
          Initially visible
          Hidden after save
      ================================================= */}

      {showForm && (
        <form
          className="form-card"
          onSubmit={handleSubmit}
        >

          {/* SECTION TITLE */}

          <div className="section-title">

            <BriefcaseBusiness size={21} />

            <div>

              <h2>
                {editingId
                  ? "Edit Designation"
                  : "Designation Details"}
              </h2>

              <p>
                {editingId
                  ? "Update designation information"
                  : "Enter designation information"}
              </p>

            </div>

          </div>

          {/* FORM GRID */}

          <div className="form-grid">

            {/* DESIGNATION CODE */}

            <div className="form-group">

              <label>

                <BriefcaseBusiness size={17} />

                Designation Code

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="designationCode"
                value={
                  formData.designationCode
                }
                onChange={handleChange}
                placeholder="Enter designation code"
              />

            </div>

            {/* DESIGNATION NAME */}

            <div className="form-group">

              <label>

                <BriefcaseBusiness size={17} />

                Designation Name

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="designationName"
                value={
                  formData.designationName
                }
                onChange={handleChange}
                placeholder="Enter designation name"
              />

            </div>

            {/* DESIGNATION TYPE */}

            <div className="form-group">

              <label>

                <BriefcaseBusiness size={17} />

                Designation Type

                <span className="required-star">
                  *
                </span>

              </label>

              <select
                name="designationType"
                value={
                  formData.designationType
                }
                onChange={handleChange}
              >

                <option value="">
                  Select designation type
                </option>

                <option value="Management">
                  Management
                </option>

                <option value="Supervisor">
                  Supervisor
                </option>

                <option value="Engineer">
                  Engineer
                </option>

                <option value="Executive">
                  Executive
                </option>

                <option value="Officer">
                  Officer
                </option>

                <option value="Staff">
                  Staff
                </option>

                <option value="Worker">
                  Worker
                </option>

                <option value="Technician">
                  Technician
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>

          {/* FORM ACTIONS */}

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
                ? "Update Designation"
                : "Save Designation"}

            </button>

          </div>

        </form>
      )}

      {/* =================================================
          RECORDS
      ================================================= */}

      <div className="form-card">

        <div className="section-title">

          <BriefcaseBusiness size={21} />

          <div>

            <h2>
              Designation Records
            </h2>

            <p>
              Click any record to edit
            </p>

          </div>

        </div>

        {loading ? (

          <div className="table-message">
            Loading designations...
          </div>

        ) : filteredDesignations.length === 0 ? (

          <div className="table-message">
            No designation records found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Designation Code
                  </th>

                  <th>
                    Designation Name
                  </th>

                  <th>
                    Designation Type
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredDesignations.map(
                  (designation, index) => (

                    <tr
                      key={
                        designation._id ||
                        designation.id ||
                        index
                      }
                      onClick={() =>
                        handleEdit(designation)
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <td>
                        {
                          designation.designationCode
                        }
                      </td>

                      <td>
                        {
                          designation.designationName
                        }
                      </td>

                      <td>
                        {
                          designation.designationType
                        }
                      </td>

                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(designation);
                          }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(
                              designation._id
                            );
                          }}
                        >
                          <Trash2 size={16} />
                        </button>

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

export default DesignationMaster;