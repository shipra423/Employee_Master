import { useEffect, useState } from "react";
import axios from "axios";

import {
  Users,
  Search,
  Plus,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";

function ContractorMaster() {
  const API_URL =
    "http://localhost:5000/api/contractors";

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    contractorCode: "",
    contractorName: "",
    contractorType: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [formData, setFormData] =
    useState(emptyForm);

  const [contractors, setContractors] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // Form initially visible
  const [showForm, setShowForm] =
    useState(true);

  // Edit mode
  const [editingId, setEditingId] =
    useState(null);

  // =====================================================
  // FETCH CONTRACTORS
  // =====================================================

  const fetchContractors = async () => {
    try {
      setLoading(true);

      const response =
        await axios.get(API_URL);

      if (Array.isArray(response.data)) {
        setContractors(response.data);
      } else if (
        Array.isArray(
          response.data.contractors
        )
      ) {
        setContractors(
          response.data.contractors
        );
      } else {
        setContractors([]);
      }
    } catch (err) {
      console.error(
        "Fetch contractors error:",
        err
      );

      setError(
        "Failed to load contractor data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchContractors();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setFormData(emptyForm);
    setEditingId(null);

    setMessage("");
    setError("");
  };

  // =====================================================
  // ADD CONTRACTOR
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
  // EDIT / CLICK RECORD
  // =====================================================

  const handleEdit = (contractor) => {
    setFormData({
      contractorCode:
        contractor.contractorCode || "",

      contractorName:
        contractor.contractorName || "",

      contractorType:
        contractor.contractorType || "",
    });

    setEditingId(contractor._id);

    setMessage("");
    setError("");

    setShowForm(true);

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

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (
      !formData.contractorCode.trim()
    ) {
      setError(
        "Contractor Code is required."
      );
      return;
    }

    if (
      !formData.contractorName.trim()
    ) {
      setError(
        "Contractor Name is required."
      );
      return;
    }

    if (
      !formData.contractorType.trim()
    ) {
      setError(
        "Contractor Type is required."
      );
      return;
    }

    try {
      setSaving(true);

      // ------------------------------------------------
      // UPDATE
      // ------------------------------------------------

      if (editingId) {
        const response =
          await axios.put(
            `${API_URL}/${editingId}`,
            formData
          );

        console.log(
          "Contractor updated:",
          response.data
        );

        setMessage(
          "Contractor updated successfully!"
        );
      }

      // ------------------------------------------------
      // NEW SAVE
      // ------------------------------------------------

      else {
        const response =
          await axios.post(
            API_URL,
            formData
          );

        console.log(
          "Contractor saved:",
          response.data
        );

        setMessage(
          "Contractor saved successfully!"
        );
      }

      // Clear form
      setFormData(emptyForm);
      setEditingId(null);

      // Refresh records
      await fetchContractors();

      // Hide form after save/update
      setShowForm(false);

    } catch (err) {
      console.error(
        "Save/update contractor error:",
        err
      );

      if (
        err.response?.data?.message
      ) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          editingId
            ? "Failed to update contractor."
            : "Failed to save contractor."
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
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this contractor?"
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
        "Contractor deleted successfully!"
      );

      if (editingId === id) {
        setFormData(emptyForm);
        setEditingId(null);
      }

      await fetchContractors();

    } catch (err) {
      console.error(
        "Delete contractor error:",
        err
      );

      if (
        err.response?.data?.message
      ) {
        setError(
          err.response.data.message
        );
      } else {
        setError(
          "Failed to delete contractor."
        );
      }
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredContractors =
    contractors.filter(
      (contractor) => {
        const search =
          searchText
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          String(
            contractor.contractorCode || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            contractor.contractorName || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            contractor.contractorType || ""
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

          <h1>
            Contractor Master
          </h1>

          <p>
            Manage contractor information
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
            placeholder="Search contractor..."
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
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

        {/* ADD BUTTON */}

        {!showForm && (
          <button
            type="button"
            className="add-employee-btn"
            onClick={handleAdd}
          >
            <Plus size={18} />

            Add Contractor
          </button>
        )}

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

          <div className="section-title">

            <Users size={21} />

            <div>

              <h2>
                {editingId
                  ? "Edit Contractor"
                  : "Contractor Details"}
              </h2>

              <p>
                {editingId
                  ? "Update contractor information"
                  : "Enter contractor information"}
              </p>

            </div>

          </div>

          <div className="form-grid">

            {/* CONTRACTOR CODE */}

            <div className="form-group">

              <label>

                <Users size={17} />

                Contractor Code

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="contractorCode"
                value={
                  formData.contractorCode
                }
                onChange={handleChange}
                placeholder="Enter contractor code"
              />

            </div>

            {/* CONTRACTOR NAME */}

            <div className="form-group">

              <label>

                <Users size={17} />

                Contractor Name

                <span className="required-star">
                  *
                </span>

              </label>

              <input
                type="text"
                name="contractorName"
                value={
                  formData.contractorName
                }
                onChange={handleChange}
                placeholder="Enter contractor name"
              />

            </div>

            {/* CONTRACTOR TYPE */}

            <div className="form-group">

              <label>

                <Users size={17} />

                Contractor Type

                <span className="required-star">
                  *
                </span>

              </label>

              <select
                name="contractorType"
                value={
                  formData.contractorType
                }
                onChange={handleChange}
              >

                <option value="">
                  Select contractor type
                </option>

                <option value="Manpower">
                  Manpower
                </option>

                <option value="Labour">
                  Labour
                </option>

                <option value="Security">
                  Security
                </option>

                <option value="Housekeeping">
                  Housekeeping
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Maintenance">
                  Maintenance
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>

          {/* ACTIONS */}

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
                ? "Update Contractor"
                : "Save Contractor"}

            </button>

          </div>

        </form>
      )}

      {/* =================================================
          CONTRACTOR RECORDS
      ================================================= */}

      <div className="form-card">

        <div className="section-title">

          <Users size={21} />

          <div>

            <h2>
              Contractor Records
            </h2>

            <p>
              Click any record to edit
            </p>

          </div>

        </div>

        {loading ? (

          <div className="table-message">
            Loading contractors...
          </div>

        ) : filteredContractors.length === 0 ? (

          <div className="table-message">
            No contractor records found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Contractor Code
                  </th>

                  <th>
                    Contractor Name
                  </th>

                  <th>
                    Contractor Type
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredContractors.map(
                  (contractor, index) => (

                    <tr
                      key={
                        contractor._id ||
                        contractor.id ||
                        index
                      }
                      onClick={() =>
                        handleEdit(contractor)
                      }
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >

                      <td>
                        {
                          contractor.contractorCode
                        }
                      </td>

                      <td>
                        {
                          contractor.contractorName
                        }
                      </td>

                      <td>
                        {
                          contractor.contractorType
                        }
                      </td>

                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit"
                          onClick={(e) => {
                            e.stopPropagation();

                            handleEdit(
                              contractor
                            );
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
                              contractor._id
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

export default ContractorMaster;