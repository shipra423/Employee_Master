import { useEffect, useState } from "react";

import {
  Search,
  Save,
  RotateCcw,
  Edit,
  UserRound,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/bank-details";

const emptyForm = {
  employeeCode: "",
  bankAcNo: "",
  ifscCode: "",
  pfNumber: "",
  pfMembershipDate: "",
  esiNumber: "",
  esiMembershipDate: "",
  panNo: "",
  pfApplicable: false,
  esiApplicable: false,
  bonusApplicable: false,
  fpf: false,
};

const getInputDate = (date) => {
  if (!date) return "";

  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return date;
  }

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function BankDetail({
  selectedEmployeeCode = "",
  onEmployeeInformation,
  onQualification,
}) {
  const initialEmployeeCode =
    selectedEmployeeCode ||
    localStorage.getItem("selectedEmployeeCode") ||
    "";

  const getSavedBankDraft = () => {
    const savedDraft =
      localStorage.getItem("bankDetailDraft");

    if (!savedDraft) {
      return {
        ...emptyForm,
        employeeCode: initialEmployeeCode,
      };
    }

    try {
      const parsedDraft = JSON.parse(savedDraft);

      if (
        parsedDraft &&
        parsedDraft.employeeCode === initialEmployeeCode &&
        parsedDraft.formData
      ) {
        return {
          ...emptyForm,
          ...parsedDraft.formData,
          employeeCode: initialEmployeeCode,
        };
      }
    } catch (err) {
      console.error(
        "Bank Detail Draft Load Error:",
        err
      );
    }

    return {
      ...emptyForm,
      employeeCode: initialEmployeeCode,
    };
  };

  const [formData, setFormData] = useState(
    getSavedBankDraft
  );

  const [records, setRecords] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD ALL RECORDS
  // =====================================================

  const loadRecords = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load bank details.");
      }

      const data = await response.json();

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Bank Details Load Error:", err);
      setError("Failed to load bank details.");
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // =====================================================
  // EMPLOYEE ID FROM EMPLOYEE DETAILS
  // =====================================================

  useEffect(() => {
    const code =
      selectedEmployeeCode ||
      localStorage.getItem("selectedEmployeeCode") ||
      "";

    if (!code) return;

    setFormData((previous) => ({
      ...previous,
      employeeCode: code,
    }));

    loadEmployeeBankDetail(code);
  }, [selectedEmployeeCode]);

  useEffect(() => {
    if (formData.employeeCode) {
      localStorage.setItem(
        "selectedEmployeeCode",
        formData.employeeCode
      );
    }

    const hasDraftData = [
      "bankAcNo",
      "ifscCode",
      "pfNumber",
      "pfMembershipDate",
      "esiNumber",
      "esiMembershipDate",
      "panNo",
      "pfApplicable",
      "esiApplicable",
      "bonusApplicable",
      "fpf",
    ].some((field) => {
      const value = formData[field];

      return typeof value === "boolean"
        ? value
        : String(value ?? "").trim() !== "";
    });

    if (formData.employeeCode && hasDraftData) {
      localStorage.setItem(
        "bankDetailDraft",
        JSON.stringify({
          employeeCode: formData.employeeCode,
          formData,
        })
      );
    } else if (!hasDraftData) {
      localStorage.removeItem("bankDetailDraft");
    }
  }, [formData]);

  // =====================================================
  // LOAD PARTICULAR EMPLOYEE BANK DETAIL
  // =====================================================

  const loadEmployeeBankDetail = async (employeeCode) => {
    if (!employeeCode) return;

    try {
      const response = await fetch(
        `${API_URL}/employee/${encodeURIComponent(
          employeeCode
        )}`
      );

      const savedDraft =
        localStorage.getItem("bankDetailDraft");

      let matchingDraft = null;

      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);

          if (
            parsedDraft &&
            parsedDraft.employeeCode === employeeCode &&
            parsedDraft.formData
          ) {
            matchingDraft = {
              ...emptyForm,
              ...parsedDraft.formData,
              employeeCode,
            };
          }
        } catch (draftErr) {
          console.error(
            "Bank Detail Draft Parse Error:",
            draftErr
          );
        }
      }

      if (response.status === 404) {
        setFormData(
          matchingDraft || {
            ...emptyForm,
            employeeCode,
          }
        );

        setEditingId(null);

        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load bank detail.");
      }

      const data = await response.json();

      setFormData(
        matchingDraft || {
          employeeCode:
            data.employeeCode || employeeCode,
          bankAcNo: data.bankAcNo || "",
          ifscCode: data.ifscCode || "",
          pfNumber: data.pfNumber || "",
          pfMembershipDate: getInputDate(
            data.pfMembershipDate
          ),
          esiNumber: data.esiNumber || "",
          esiMembershipDate: getInputDate(
            data.esiMembershipDate
          ),
          panNo: data.panNo || "",
          pfApplicable: Boolean(data.pfApplicable),
          esiApplicable: Boolean(data.esiApplicable),
          bonusApplicable: Boolean(
            data.bonusApplicable
          ),
          fpf: Boolean(data.fpf),
        }
      );

      setEditingId(data._id || null);
    } catch (err) {
      console.error("Bank Detail Error:", err);
    }
  };

  // =====================================================
  // CHANGE
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
  // CLEAR
  // =====================================================

  const handleClear = () => {
    const storedEmployeeCode =
      selectedEmployeeCode ||
      localStorage.getItem("selectedEmployeeCode") ||
      "";

    setFormData({
      ...emptyForm,
      employeeCode: storedEmployeeCode,
    });

    setEditingId(null);
    setMessage("");
    setError("");

    localStorage.removeItem(
      "bankDetailDraft"
    );
  };

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.employeeCode.trim()) {
      setError(
        "Please select an employee from Employee Information."
      );
      return;
    }

    try {
      setLoading(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save bank details."
        );
      }

      setMessage(
        editingId
          ? "Bank details updated successfully!"
          : "Bank details saved successfully!"
      );

      setEditingId(data._id || null);

      await loadRecords();

      if (formData.employeeCode) {
        await loadEmployeeBankDetail(
          formData.employeeCode
        );
      }
    } catch (err) {
      console.error(
        "Bank Detail Save Error:",
        err
      );

      setError(
        err.message ||
          "Failed to save bank details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const search =
    searchText.toLowerCase().trim();

  const filteredRecords = records.filter(
    (item) => {
      return (
        item.employeeCode
          ?.toLowerCase()
          .includes(search) ||
        item.bankAcNo
          ?.toLowerCase()
          .includes(search) ||
        item.ifscCode
          ?.toLowerCase()
          .includes(search) ||
        item.panNo
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (item) => {
    setFormData({
      employeeCode:
        item.employeeCode || "",
      bankAcNo:
        item.bankAcNo || "",
      ifscCode:
        item.ifscCode || "",
      pfNumber:
        item.pfNumber || "",
      pfMembershipDate:
        getInputDate(
          item.pfMembershipDate
        ),
      esiNumber:
        item.esiNumber || "",
      esiMembershipDate:
        getInputDate(
          item.esiMembershipDate
        ),
      panNo:
        item.panNo || "",
      pfApplicable:
        Boolean(item.pfApplicable),
      esiApplicable:
        Boolean(item.esiApplicable),
      bonusApplicable:
        Boolean(item.bonusApplicable),
      fpf:
        Boolean(item.fpf),
    });

    localStorage.setItem(
      "selectedEmployeeCode",
      item.employeeCode || ""
    );

    setEditingId(item._id || null);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bank-detail-page">

        
<div className="page-header">
  <h1>Employee Master</h1>
</div>
      {/* SEARCH */}

      <div className="employee-toolbar">
        <div className="employee-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search employee / bank detail..."
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
              ×
            </button>
          )}

        </div>
      </div>

      {/* TABS */}

      <div className="employee-tabs">

        <button
          type="button"
          className="employee-tab"
          onClick={onEmployeeInformation}
        >
          Employee Information
        </button>

        <button
          type="button"
          className="employee-tab active"
        >
          Bank Detail
        </button>

        <button
          type="button"
          className="employee-tab"
          onClick={onQualification}
        >
          Qualification
        </button>

      </div>

      {/* BANK FORM */}

      <form
        className="bank-detail-form"
        onSubmit={handleSubmit}
      >

        <div className="bank-employee-bar">

          <label>
            <UserRound size={16} />
            Employee ID
          </label>

          <input
            type="text"
            value={formData.employeeCode}
            readOnly
          />

        </div>

        <div className="bank-reference-layout">

          {/* LEFT BOX */}

          <div className="bank-reference-box bank-left-box">

            <div className="bank-reference-title">
              Bank Detail
            </div>

            <div className="bank-reference-row">

              <label>
                Bank Ac/No
              </label>

              <input
                type="text"
                name="bankAcNo"
                value={formData.bankAcNo}
                onChange={handleChange}
              />

            </div>

            <div className="bank-reference-row">

              <label>
                IFSC Code
              </label>

              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* RIGHT BOX */}

          <div className="bank-reference-box bank-right-box">

            <div className="bank-reference-row">

              <label>
                PF Number
              </label>

              <input
                type="text"
                name="pfNumber"
                value={formData.pfNumber}
                onChange={handleChange}
              />

            </div>

            <div className="bank-reference-row">

              <label>
                PF Membership Date
              </label>

              <input
                type="date"
                name="pfMembershipDate"
                value={
                  formData.pfMembershipDate
                }
                onChange={handleChange}
              />

            </div>

            <div className="bank-reference-row">

              <label>
                ESI Number
              </label>

              <input
                type="text"
                name="esiNumber"
                value={formData.esiNumber}
                onChange={handleChange}
              />

            </div>

            <div className="bank-reference-row">

              <label>
                ESI Membership Date
              </label>

              <input
                type="date"
                name="esiMembershipDate"
                value={
                  formData.esiMembershipDate
                }
                onChange={handleChange}
              />

            </div>

            <div className="bank-reference-row">

              <label>
                PAN No
              </label>

              <input
                type="text"
                name="panNo"
                value={formData.panNo}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>

        {/* CHECKBOX */}

        <div className="bank-reference-checkbox-box">

          <label>
            PF Applicable

            <input
              type="checkbox"
              name="pfApplicable"
              checked={
                formData.pfApplicable
              }
              onChange={handleChange}
            />
          </label>

          <label>
            ESI Applicable

            <input
              type="checkbox"
              name="esiApplicable"
              checked={
                formData.esiApplicable
              }
              onChange={handleChange}
            />
          </label>

          <label>
            Bonus Applicable

            <input
              type="checkbox"
              name="bonusApplicable"
              checked={
                formData.bonusApplicable
              }
              onChange={handleChange}
            />
          </label>

          <label>
            FPF

            <input
              type="checkbox"
              name="fpf"
              checked={formData.fpf}
              onChange={handleChange}
            />
          </label>

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

        {/* BUTTONS */}

        <div className="form-actions">

          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
          >
            <RotateCcw size={17} />
            Clear
          </button>

          <button
            type="submit"
            className="next-btn"
            disabled={loading}
          >
            <Save size={17} />

            {loading
              ? "Saving..."
              : editingId
              ? "Update"
              : "Save"}
          </button>

        </div>

      </form>

      {/* SEARCH RESULTS */}

      {searchText.trim() && (
        <div className="employee-search-results">

          <div className="search-results-header">

            <strong>
              Bank Detail Search Results
            </strong>

            <span>
              {filteredRecords.length} record(s)
            </span>

          </div>

          {filteredRecords.length === 0 ? (
            <div className="no-search-result">
              No bank detail found.
            </div>
          ) : (
            <div className="employee-results-table">

              <table>

                <thead>

                  <tr>
                    <th>Employee ID</th>
                    <th>Bank A/C No</th>
                    <th>IFSC</th>
                    <th>PF Number</th>
                    <th>ESI Number</th>
                    <th>PAN</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredRecords.map(
                    (item) => (
                      <tr key={item._id}>

                        <td>
                          {item.employeeCode}
                        </td>

                        <td>
                          {item.bankAcNo || "-"}
                        </td>

                        <td>
                          {item.ifscCode || "-"}
                        </td>

                        <td>
                          {item.pfNumber || "-"}
                        </td>

                        <td>
                          {item.esiNumber || "-"}
                        </td>

                        <td>
                          {item.panNo || "-"}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            <Edit size={15} />
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
      )}

    </div>
  );
}

export default BankDetail;