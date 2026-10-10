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
  
  Pencil,
} from "lucide-react";

function UnitMaster() {
  const API_URL = "http://localhost:5000/api/units";

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    unitCode: "",
    unitName: "",
    unitType: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] = useState(emptyForm);

  const [units, setUnits] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  // Form initially OPEN
  const [showForm, setShowForm] = useState(true);

  // null = adding new record
  // id = editing existing record
  const [editingId, setEditingId] = useState(null);

  // =====================================================
  // FETCH UNITS
  // =====================================================

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      if (Array.isArray(response.data)) {
        setUnits(response.data);
      } else {
        setUnits([]);
      }
    } catch (err) {
      console.error("Fetch units error:", err);

      setError("Failed to load unit data.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchUnits();
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
  // ADD NEW UNIT
  // =====================================================

  const handleAdd = () => {
    setFormData(emptyForm);

    setEditingId(null);

    setMessage("");

    setError("");

    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const handleCloseForm = () => {
    setFormData(emptyForm);

    setEditingId(null);

    setMessage("");

    setError("");

    setShowForm(false);
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const handleClear = () => {
    setFormData(emptyForm);

    setMessage("");

    setError("");

    // If editing, clear means new entry mode
    setEditingId(null);
  };

  // =====================================================
  // EDIT / SELECT SAVED RECORD
  // =====================================================

  const handleRowClick = (unit) => {
    setFormData({
      unitCode: unit.unitCode || "",
      unitName: unit.unitName || "",
      unitType: unit.unitType || "",
    });

    setEditingId(unit._id);

    setMessage("");

    setError("");

    setShowForm(true);

    // Page automatically scrolls to top
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

    if (!formData.unitCode.trim()) {
      setError("Unit Code is required.");
      return;
    }

    if (!formData.unitName.trim()) {
      setError("Unit Name is required.");
      return;
    }

    if (!formData.unitType.trim()) {
      setError("Unit Type is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        unitCode: formData.unitCode.trim(),
        unitName: formData.unitName.trim(),
        unitType: formData.unitType.trim(),
      };

      // =================================================
      // UPDATE EXISTING
      // =================================================

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          payload
        );

        console.log("Unit updated:", response.data);

        setMessage("Unit updated successfully!");
      }

      // =================================================
      // ADD NEW
      // =================================================

      else {
        const response = await axios.post(
          API_URL,
          payload
        );

        console.log("Unit saved:", response.data);

        setMessage("Unit saved successfully!");
      }

      // =================================================
      // REFRESH LIST
      // =================================================

      await fetchUnits();

      // =================================================
      // CLEAR FORM
      // =================================================

      setFormData(emptyForm);

      setEditingId(null);

      // =================================================
      // IMPORTANT:
      // FORM WILL HIDE AFTER SAVE / UPDATE
      // =================================================

      setTimeout(() => {
        setShowForm(false);

        setMessage("");
      }, 700);
    } catch (err) {
      console.error("Save / Update unit error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          editingId
            ? "Failed to update unit."
            : "Failed to save unit."
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

  const filteredUnits = units.filter((unit) => {
    const search = searchText
      .toLowerCase()
      .trim();

    if (!search) {
      return true;
    }

    return (
      String(unit.unitCode || "")
        .toLowerCase()
        .includes(search) ||

      String(unit.unitName || "")
        .toLowerCase()
        .includes(search) ||

      String(unit.unitType || "")
        .toLowerCase()
        .includes(search)
    );
  });

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="employee-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">

        <div>
          <h1>Unit Master</h1>
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
            placeholder="Search unit..."
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

        {/* ADD UNIT */}

        {!showForm && (
          <button
            type="button"
            className="add-employee-btn"
            onClick={handleAdd}
          >
            <Plus size={18} />

            Add Unit
          </button>
        )}

      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {message && !showForm && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && !showForm && (
        <div className="error-message">

          <AlertCircle size={17} />

          {error}

        </div>
      )}

      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {showForm && (

        <form
          className="form-card"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              FORM TITLE
          ================================================= */}

          <div
            className="section-title"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >

              <Building2 size={21} />

              <div>

                <h2>
                  {editingId
                    ? "Edit Unit"
                    : "Unit Details"}
                </h2>

              </div>

            </div>

            {/* CLOSE FORM */}

            <button
              type="button"
              onClick={handleCloseForm}
              title="Close"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={20} />
            </button>

          </div>

          {/* =================================================
              FORM GRID
          ================================================= */}

          <div className="form-grid">

            {/* UNIT CODE */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Unit Code

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="unitCode"
                value={formData.unitCode}
                onChange={handleChange}
                placeholder="Enter unit code"
              />

            </div>

            {/* UNIT NAME */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Unit Name

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="unitName"
                value={formData.unitName}
                onChange={handleChange}
                placeholder="Enter unit name"
              />

            </div>

            {/* UNIT TYPE */}

            <div className="form-group">

              <label>

                <Building2 size={17} />

                Unit Type

                <span className="required-star">
                  *
                </span>

              </label>

              <select
                name="unitType"
                value={formData.unitType}
                onChange={handleChange}
              >

                <option value="">
                  Select unit type
                </option>

                <option value="Plant">
                  Plant
                </option>

                <option value="Factory">
                  Factory
                </option>

                <option value="Office">
                  Office
                </option>

                <option value="Warehouse">
                  Warehouse
                </option>

                <option value="Site">
                  Site
                </option>

              </select>

            </div>

          </div>

          {/* =================================================
              FORM MESSAGES
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
              FORM ACTIONS
          ================================================= */}

          <div className="form-actions">

            {/* CLEAR */}

            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              disabled={saving}
            >

              <RotateCcw size={17} />

              Clear

            </button>

            {/* SAVE / UPDATE */}

            <button
              type="submit"
              className="next-btn"
              disabled={saving}
            >

              {saving ? (
                editingId
                  ? "Updating..."
                  : "Saving..."
              ) : (
                <>
                  {editingId ? (
                    <Pencil size={17} />
                  ) : (
                    <Save size={17} />
                  )}

                  {editingId
                    ? "Update Unit"
                    : "Save Unit"}
                </>
              )}

            </button>

          </div>

        </form>

      )}

      {/* =================================================
          UNIT RECORDS
      ================================================= */}

      <div className="form-card">

        <div className="section-title">

          <Building2 size={21} />

          <div>

            <h2>
              Unit Records
            </h2>

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="table-message">
            Loading units...
          </div>

        ) : filteredUnits.length === 0 ? (

          /* =================================================
             NO RECORD
          ================================================= */

          <div className="table-message">
            No unit records found.
          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Unit Code
                  </th>

                  <th>
                    Unit Name
                  </th>

                  <th>
                    Unit Type
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUnits.map((unit) => (

                  <tr
                    key={unit._id}
                    onClick={() =>
                      handleRowClick(unit)
                    }
                    style={{
                      cursor: "pointer",
                    }}
                    title="Click to edit"
                  >

                    <td>
                      {unit.unitCode}
                    </td>

                    <td>
                      {unit.unitName}
                    </td>

                    <td>
                      {unit.unitType}
                    </td>

                    <td>

                      {/* EDIT */}

                      <button
                        type="button"
                        className="edit-btn"
                        title="Edit Unit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(unit);
                        }}
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DELETE */}

                      

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default UnitMaster;