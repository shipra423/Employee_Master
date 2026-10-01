import { useEffect, useState } from "react";

import {
  Search,
  Save,
  RotateCcw,
  Edit,
  UserRound,
} from "lucide-react";

const API_URL =
  "http://localhost:5000/api/qualifications";

const emptyRow = {
  code: "",
  qualification: "",
  institution: "",
  fromYear: "",
  toYear: "",
  university: "",
  division: "First Div.",
  marksPercentage: "",
};

const createRows = () => {
  return Array.from(
    { length: 8 },
    () => ({
      ...emptyRow,
    })
  );
};

function Qualification({
  selectedEmployeeCode = "",
  onEmployeeInformation,
  onBankDetail,
}) {
  const initialEmployeeCode =
    selectedEmployeeCode ||
    localStorage.getItem("selectedEmployeeCode") ||
    "";

  const getSavedQualificationDraft = () => {
    const savedDraft =
      localStorage.getItem(
        "qualificationDraft"
      );

    if (!savedDraft) {
      return createRows();
    }

    try {
      const parsedDraft =
        JSON.parse(savedDraft);

      if (
        parsedDraft &&
        parsedDraft.employeeCode ===
          initialEmployeeCode &&
        Array.isArray(parsedDraft.rows)
      ) {
        const draftRows =
          parsedDraft.rows.slice(0, 8);

        while (draftRows.length < 8) {
          draftRows.push({
            ...emptyRow,
          });
        }

        return draftRows;
      }
    } catch (err) {
      console.error(
        "Qualification Draft Load Error:",
        err
      );
    }

    return createRows();
  };

  const [employeeCode, setEmployeeCode] =
    useState(initialEmployeeCode);

  const [rows, setRows] =
    useState(getSavedQualificationDraft);

  const [records, setRecords] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // LOAD ALL
  // =====================================================

  const loadRecords = async () => {
    try {
      const response =
        await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to load qualification data."
        );
      }

      const data =
        await response.json();

      setRecords(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Qualification Load Error:",
        err
      );

      setError(
        "Failed to load qualification data."
      );
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // =====================================================
  // EMPLOYEE CHANGE
  // =====================================================

  useEffect(() => {
    const code =
      selectedEmployeeCode ||
      localStorage.getItem(
        "selectedEmployeeCode"
      ) ||
      "";

    if (!code) {
      return;
    }

    setEmployeeCode(code);

    loadEmployeeQualifications(code);
  }, [selectedEmployeeCode]);

  useEffect(() => {
    if (employeeCode) {
      localStorage.setItem(
        "selectedEmployeeCode",
        employeeCode
      );
    }

    const hasDraftData = rows.some(
      (row) =>
        row.code ||
        row.qualification ||
        row.institution ||
        row.fromYear ||
        row.toYear ||
        row.university ||
        row.marksPercentage
    );

    if (employeeCode && hasDraftData) {
      localStorage.setItem(
        "qualificationDraft",
        JSON.stringify({
          employeeCode,
          rows,
        })
      );
    } else if (!hasDraftData) {
      localStorage.removeItem(
        "qualificationDraft"
      );
    }
  }, [employeeCode, rows]);

  // =====================================================
  // LOAD EMPLOYEE QUALIFICATION
  // =====================================================

  const loadEmployeeQualifications =
    async (code) => {
      if (!code) return;

      try {
        const response =
          await fetch(
            `${API_URL}/employee/${encodeURIComponent(
              code
            )}`
          );

        const savedDraft =
          localStorage.getItem(
            "qualificationDraft"
          );

        let matchingDraft = null;

        if (savedDraft) {
          try {
            const parsedDraft =
              JSON.parse(savedDraft);

            if (
              parsedDraft &&
              parsedDraft.employeeCode ===
                code &&
              Array.isArray(
                parsedDraft.rows
              )
            ) {
              matchingDraft =
                parsedDraft.rows.slice(
                  0,
                  8
                );

              while (
                matchingDraft.length < 8
              ) {
                matchingDraft.push({
                  ...emptyRow,
                });
              }
            }
          } catch (draftErr) {
            console.error(
              "Qualification Draft Parse Error:",
              draftErr
            );
          }
        }

        if (response.status === 404) {
          setRows(
            matchingDraft ||
              createRows()
          );

          setEditingId(null);

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load qualification."
          );
        }

        const data =
          await response.json();

        const savedRows =
          Array.isArray(data)
            ? data
            : data.rows || [];

        const finalRows =
          savedRows.map((item) => ({
            code: item.code || "",
            qualification:
              item.qualification || "",
            institution:
              item.institution || "",
            fromYear:
              item.fromYear || "",
            toYear:
              item.toYear || "",
            university:
              item.university || "",
            division:
              item.division ||
              "First Div.",
            marksPercentage:
              item.marksPercentage ||
              "",
          }));

        while (finalRows.length < 8) {
          finalRows.push({
            ...emptyRow,
          });
        }

        setRows(
          matchingDraft ||
            finalRows.slice(0, 8)
        );

        setEditingId(
          Array.isArray(data)
            ? null
            : data._id || null
        );
      } catch (err) {
        console.error(
          "Qualification Detail Error:",
          err
        );
      }
    };

  // =====================================================
  // ROW CHANGE
  // =====================================================

  const handleRowChange = (
    index,
    field,
    value
  ) => {
    setRows((previous) => {
      const updated = [
        ...previous,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });

    setMessage("");
    setError("");
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setRows(createRows());

    setEditingId(null);

    setMessage("");
    setError("");

    localStorage.removeItem(
      "qualificationDraft"
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!employeeCode.trim()) {
      setError(
        "Please select an employee from Employee Information."
      );

      return;
    }

    const filledRows =
      rows.filter(
        (row) =>
          row.code ||
          row.qualification ||
          row.institution ||
          row.fromYear ||
          row.toYear ||
          row.university ||
          row.marksPercentage
      );

    try {
      setLoading(true);

      const payload = {
        employeeCode,
        rows: filledRows,
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(payload),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save qualification."
        );
      }

      setMessage(
        editingId
          ? "Qualification updated successfully!"
          : "Qualification saved successfully!"
      );

      setEditingId(
        data._id || null
      );

      await loadRecords();

      await loadEmployeeQualifications(
        employeeCode
      );
    } catch (err) {
      console.error(
        "Qualification Save Error:",
        err
      );

      setError(
        err.message ||
          "Failed to save qualification."
      );
    } finally {
      setLoading(false);
    }
  };
  

  // =====================================================
  // SEARCH
  // =====================================================

  const search =
    searchText
      .toLowerCase()
      .trim();

  const filteredRecords =
    records.filter((item) => {
      return (
        item.employeeCode
          ?.toLowerCase()
          .includes(search)
      );
    });

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (item) => {
    setEmployeeCode(
      item.employeeCode || ""
    );

    const savedRows =
      Array.isArray(item.rows)
        ? item.rows
        : [];

    const finalRows =
      savedRows.map((row) => ({
        code: row.code || "",
        qualification:
          row.qualification || "",
        institution:
          row.institution || "",
        fromYear:
          row.fromYear || "",
        toYear:
          row.toYear || "",
        university:
          row.university || "",
        division:
          row.division ||
          "First Div.",
        marksPercentage:
          row.marksPercentage ||
          "",
      }));

    while (finalRows.length < 8) {
      finalRows.push({
        ...emptyRow,
      });
    }

    setRows(
      finalRows.slice(0, 8)
    );

    setEditingId(
      item._id || null
    );

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="qualification-page">
         
         <div className="page-header">
  <h1>Employee Master</h1>
</div>

      {/* SEARCH */}

      <div className="employee-toolbar">

        <div className="employee-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search employee qualification..."
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
          onClick={
            onEmployeeInformation
          }
        >
          Employee Information
        </button>

        <button
          type="button"
          className="employee-tab"
          onClick={onBankDetail}
        >
          Bank Detail
        </button>

        <button
          type="button"
          className="employee-tab active"
        >
          Qualification
        </button>

      </div>

      {/* EMPLOYEE */}

      <div className="qualification-employee">

        <label>
          <UserRound size={16} />
          Employee ID
        </label>

        <input
          type="text"
          value={employeeCode}
          readOnly
        />

      </div>

      {/* QUALIFICATION GRID */}

      <form
        onSubmit={handleSubmit}
        className="qualification-form"
      >

        <div className="qualification-table-wrapper">

          <table className="qualification-table">

            <thead>

              <tr>

                <th rowSpan="2">
                  Code 
                </th>

                <th rowSpan="2">
                  Qualification
                </th>

                <th rowSpan="2">
                  Institution
                </th>

                <th colSpan="2">
                  Year
                </th>

                <th rowSpan="2">
                  University
                </th>

                <th rowSpan="2">
                  Division
                </th>

                <th rowSpan="2">
                  %age of
                  <br />
                  Marks
                </th>

              </tr>

              <tr>

                <th>
                  From
                </th>

                <th>
                  To
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map(
                (row, index) => (
                  <tr key={index}>

                    <td>
                      <input
                        type="text"
                        value={
                          row.code
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "code",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.qualification
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "qualification",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.institution
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.fromYear
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "fromYear",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.toYear
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "toYear",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={
                          row.university
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "university",
                            e.target.value
                          )
                        }
                      />
                    </td>

                    <td>

                      <select
                        value={
                          row.division
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "division",
                            e.target.value
                          )
                        }
                      >

                        <option>
                          First Div.
                        </option>

                        <option>
                          Second Div.
                        </option>

                        <option>
                          Third Div.
                        </option>

                        <option>
                          Pass
                        </option>

                      </select>

                    </td>

                    <td>

                      <input
                        type="text"
                        value={
                          row.marksPercentage
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "marksPercentage",
                            e.target.value
                          )
                        }
                      />

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

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
              Qualification Search Results
            </strong>

            <span>
              {filteredRecords.length} record(s)
            </span>

          </div>

          {filteredRecords.length === 0 ? (
            <div className="no-search-result">
              No qualification found.
            </div>
          ) : (
            <div className="employee-results-table">

              <table>

                <thead>

                  <tr>

                    <th>
                      Employee ID
                    </th>

                    <th>
                      Qualification
                    </th>

                    <th>
                      University
                    </th>

                    <th>
                      Division
                    </th>

                    <th>
                      % Marks
                    </th>

                    <th>
                      Action
                    </th>

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
                          {item.rows
                            ?.map(
                              (r) =>
                                r.qualification
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>
                          {item.rows
                            ?.map(
                              (r) =>
                                r.university
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>
                          {item.rows
                            ?.map(
                              (r) =>
                                r.division
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>
                          {item.rows
                            ?.map(
                              (r) =>
                                r.marksPercentage
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit"
                            onClick={() =>
                              handleEdit(
                                item
                              )
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

export default Qualification;