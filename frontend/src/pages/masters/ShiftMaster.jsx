import { useEffect, useState } from "react";

import {
  Clock3,
  Search,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  Edit,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/shifts";

const emptyForm = {
  shiftCode: "",
  shiftName: "",
  startTime: "",
  endTime: "",
};

const ShiftMaster = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [shifts, setShifts] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shifts.");
      }

      setShifts(Array.isArray(data) ? data : data.shifts || []);
    } catch (err) {
      console.error("Fetch Shift Error:", err);
      setError(err.message || "Failed to load shift records.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const handleEdit = (shift) => {
    setFormData({
      shiftCode: shift.shiftCode || "",
      shiftName: shift.shiftName || "",
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
    });

    setEditingId(shift._id);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.shiftCode.trim() ||
      !formData.shiftName.trim() ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shiftCode: formData.shiftCode.trim(),
          shiftName: formData.shiftName.trim(),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shift.");
      }

      setMessage(
        editingId
          ? "Shift updated successfully!"
          : "Shift saved successfully!"
      );

      handleClear();
      await fetchShifts();
    } catch (err) {
      console.error("Save Shift Error:", err);
      setError(err.message || "Failed to save shift.");
    } finally {
      setLoading(false);
    }
  };

  const filteredShifts = shifts.filter((shift) => {
    const search = searchText.toLowerCase().trim();

    if (!search) return true;

    return (
      String(shift.shiftCode || "")
        .toLowerCase()
        .includes(search) ||
      String(shift.shiftName || "")
        .toLowerCase()
        .includes(search) ||
      String(shift.startTime || "")
        .toLowerCase()
        .includes(search) ||
      String(shift.endTime || "")
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="shift-master-page">

      {/* HEADER */}
      <div className="shift-page-header">

        <div className="shift-page-title">
          <Clock3 size={30} />

          <div>
            <h1>Shift Master</h1>
            <p>Manage shift information</p>
          </div>
        </div>

        <button className="shift-master-btn">
          Master Data
        </button>

      </div>

      {/* SEARCH */}
      <div className="shift-search-main">
        <Search size={19} />

        <input
          type="text"
          placeholder="Search shift..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* ERROR / SUCCESS */}
      {message && (
        <div className="shift-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="shift-error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* FORM CARD */}
      {showForm && (
        <div className="shift-section-card">

          <div className="shift-section-header">

            <div className="shift-section-heading">
              <Clock3 size={24} />

              <div>
                <h2>Shift Details</h2>
                <p>Enter shift information</p>
              </div>
            </div>

            <button
              type="button"
              className="shift-close-btn"
              onClick={() => {
                setShowForm(false);
                handleClear();
              }}
            >
              <X size={18} />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="shift-form-grid">

              <div className="shift-field">
                <label>
                  Shift Code <span>*</span>
                </label>

                <input
                  type="text"
                  name="shiftCode"
                  value={formData.shiftCode}
                  onChange={handleChange}
                  placeholder="Enter shift code"
                />
              </div>

              <div className="shift-field">
                <label>
                  Shift Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="shiftName"
                  value={formData.shiftName}
                  onChange={handleChange}
                  placeholder="Enter shift name"
                />
              </div>

              <div className="shift-field">
                <label>
                  Start Time <span>*</span>
                </label>

                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="shift-field">
                <label>
                  End Time <span>*</span>
                </label>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="shift-form-footer">

              <button
                type="button"
                className="shift-clear-btn"
                onClick={handleClear}
              >
                <RotateCcw size={16} />
                Clear
              </button>

              <button
                type="submit"
                className="shift-save-btn"
                disabled={loading}
              >
                <Save size={16} />
                {editingId ? "Update Shift" : "Save Shift"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* RECORDS */}
      <div className="shift-section-card shift-records-card">

        <div className="shift-section-header">

          <div className="shift-section-heading">
            <Clock3 size={24} />

            <div>
              <h2>Shift Records</h2>
              <p>Click any record to edit</p>
            </div>
          </div>

        </div>

        <div className="shift-table-wrapper">

          <table className="shift-table">

            <thead>
              <tr>
                <th>Shift Code</th>
                <th>Shift Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <tr
                    key={shift._id}
                    onClick={() => handleEdit(shift)}
                    className="shift-row"
                  >
                    <td>{shift.shiftCode}</td>

                    <td>{shift.shiftName}</td>

                    <td>{shift.startTime}</td>

                    <td>{shift.endTime}</td>

                    <td>
                      <button
                        type="button"
                        className="shift-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(shift);
                        }}
                      >
                        <Edit size={15} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="shift-no-record"
                  >
                    No shift records found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default ShiftMaster;