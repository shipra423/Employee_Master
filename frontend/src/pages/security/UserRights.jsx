import { useState } from "react";

import {
  ShieldCheck,
  Search,
  Copy,
  Save,
  RotateCcw,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";

import "../../styles/UserRights.css";

function UserRights() {
  // =====================================================
  // USER DATA
  // =====================================================

  const [users, setUsers] = useState([]);

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  // =====================================================
  // TOP OPTIONS
  // =====================================================

  const [menuOption, setMenuOption] = useState("");
  const [privilegeAll, setPrivilegeAll] = useState(false);

  const [addAll, setAddAll] = useState(false);
  const [modAll, setModAll] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [delAll, setDelAll] = useState(false);

  // =====================================================
  // FIND
  // =====================================================

  const [findOption, setFindOption] = useState("");
  const [searchText, setSearchText] = useState("");

  // =====================================================
  // EDIT
  // =====================================================

  const [editIndex, setEditIndex] = useState(null);

  // =====================================================
  // TABLE DATA
  // =====================================================

  const emptyRow = {
    fileId: "",
    type: "",
    shortName: "",
    add: false,
    mod: false,
    view: false,
    del: false,
    fromDate: new Date().toISOString().split("T")[0],
    toDate: "",
  };

  const [rows, setRows] = useState([
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
    { ...emptyRow },
  ]);

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");

  // =====================================================
  // HANDLE TABLE CHANGE
  // =====================================================

  const handleRowChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );

    setMessage("");
  };

  // =====================================================
  // ADD NEW ROW
  // =====================================================

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        ...emptyRow,
        fromDate: new Date()
          .toISOString()
          .split("T")[0],
      },
    ]);
  };

  // =====================================================
  // DELETE ROW
  // =====================================================

  const deleteRow = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this row?"
    );

    if (!confirmDelete) return;

    setRows((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setMessage("Row deleted successfully.");
  };

  // =====================================================
  // EDIT ROW
  // =====================================================

  const editRow = (index) => {
    setEditIndex(index);
    setMessage(
      `Editing row ${index + 1}`
    );
  };

  // =====================================================
  // SAVE ROW
  // =====================================================

  const saveRow = (index) => {
    setEditIndex(null);
    setMessage(
      `Row ${index + 1} saved successfully.`
    );
  };

  // =====================================================
  // ADD USER
  // =====================================================

  const handleAddUser = () => {
    if (!userName || !userId) {
      setMessage(
        "Please enter User Name and User ID."
      );
      return;
    }

    setUsers((prev) => [
      ...prev,
      {
        userName,
        userId,
      },
    ]);

    setMessage("User added successfully.");
  };

  // =====================================================
  // COPY USER
  // =====================================================

  const handleCopyUser = () => {
    if (!userId) {
      setMessage("Please select a User first.");
      return;
    }

    setMessage(
      `Rights copied for User ID: ${userId}`
    );
  };

  // =====================================================
  // APPLY ALL PRIVILEGES
  // =====================================================

  const handlePrivilegeAll = (checked) => {
    setPrivilegeAll(checked);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        add: checked,
        mod: checked,
        view: checked,
        del: checked,
      }))
    );

    setAddAll(checked);
    setModAll(checked);
    setViewAll(checked);
    setDelAll(checked);
  };

  // =====================================================
  // APPLY INDIVIDUAL COLUMN
  // =====================================================

  const handleColumnAll = (field, checked) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        [field]: checked,
      }))
    );

    if (field === "add") setAddAll(checked);
    if (field === "mod") setModAll(checked);
    if (field === "view") setViewAll(checked);
    if (field === "del") setDelAll(checked);
  };

  // =====================================================
  // FIND
  // =====================================================

  const handleFind = () => {
    if (!searchText) {
      setMessage("Enter option to find.");
      return;
    }

    setMessage(
      `Searching for: ${searchText}`
    );
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetPage = () => {
    setUserName("");
    setUserId("");
    setMenuOption("");
    setFindOption("");
    setSearchText("");
    setPrivilegeAll(false);
    setAddAll(false);
    setModAll(false);
    setViewAll(false);
    setDelAll(false);
    setEditIndex(null);
    setMessage("");

    setRows([
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
      { ...emptyRow },
    ]);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="user-rights-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="user-rights-header">

        <div className="user-rights-title">

          <div className="user-rights-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1>User Rights</h1>

          </div>

        </div>

        <div className="user-rights-header-actions">

          <button
            type="button"
            className="ur-btn ur-btn-add"
            onClick={handleAddUser}
          >
            <Plus size={15} />
            Add User
          </button>

          <button
            type="button"
            className="ur-btn ur-btn-reset"
            onClick={resetPage}
          >
            <RotateCcw size={15} />
            Reset
          </button>

        </div>

      </div>

      {/* =================================================
          TOP CONTROL PANEL
      ================================================= */}

      <div className="user-rights-control-panel">

        {/* USER NAME */}

        <div className="ur-control-group">

          <label>User Name</label>

          <input
            type="text"
            value={userName}
            onChange={(e) =>
              setUserName(e.target.value)
            }
            placeholder="User Name"
          />

          <input
            className="ur-small-input"
            type="text"
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value)
            }
            placeholder="ID"
          />

          <button
            type="button"
            className="ur-icon-btn"
            title="Search User"
          >
            <Search size={14} />
          </button>

        </div>

        {/* COPY USER */}

        <div className="ur-copy-group">

          <label>Copy User</label>

          <input
            type="text"
            placeholder="User ID"
          />

          <button
            type="button"
            className="ur-icon-btn"
            title="Search"
          >
            <Search size={14} />
          </button>

        </div>

        {/* MENU OPTIONS */}

        <div className="ur-control-row">

          <div className="ur-field">

            <label>Menu Options</label>

            <select
              value={menuOption}
              onChange={(e) =>
                setMenuOption(e.target.value)
              }
            >
              <option value="">
                Select Option
              </option>

              <option value="employee">
                Employee Master
              </option>

              <option value="attendance">
                Attendance
              </option>

              <option value="salary">
                PF / ESI / Salary
              </option>

              <option value="security">
                Security
              </option>

            </select>

          </div>

          {/* PRIVILEGE */}

          <div className="ur-privilege">

            <label>Privilege</label>

            <div className="ur-check-item">

              <input
                type="checkbox"
                checked={privilegeAll}
                onChange={(e) =>
                  handlePrivilegeAll(
                    e.target.checked
                  )
                }
              />

              <span>All</span>

            </div>

            <div className="ur-column-checks">

              <label>
                <input
                  type="checkbox"
                  checked={addAll}
                  onChange={(e) =>
                    handleColumnAll(
                      "add",
                      e.target.checked
                    )
                  }
                />
                ADD
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={modAll}
                  onChange={(e) =>
                    handleColumnAll(
                      "mod",
                      e.target.checked
                    )
                  }
                />
                MOD
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={viewAll}
                  onChange={(e) =>
                    handleColumnAll(
                      "view",
                      e.target.checked
                    )
                  }
                />
                VIEW
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={delAll}
                  onChange={(e) =>
                    handleColumnAll(
                      "del",
                      e.target.checked
                    )
                  }
                />
                DEL
              </label>

            </div>

          </div>

          {/* COPY */}

          <button
            type="button"
            className="ur-copy-btn"
            onClick={handleCopyUser}
          >
            <Copy size={14} />
            Copy
          </button>

        </div>

      </div>

      {/* =================================================
          FIND OPTION
      ================================================= */}

      <div className="ur-find-bar">

        <label>Find Option</label>

        <input
          type="text"
          value={searchText}
          onChange={(e) =>
            setSearchText(e.target.value)
          }
          placeholder="Enter option"
        />

        <select
          value={findOption}
          onChange={(e) =>
            setFindOption(e.target.value)
          }
        >
          <option value="">
            List
          </option>

          <option value="fileId">
            File ID
          </option>

          <option value="type">
            Type
          </option>

          <option value="shortName">
            Short Name
          </option>
        </select>

        <button
          type="button"
          className="ur-find-btn"
          onClick={handleFind}
        >
          <Search size={14} />
          FIND
        </button>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="ur-message">
          {message}

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* =================================================
          RIGHTS TABLE
      ================================================= */}

      <div className="ur-table-card">

        <div className="ur-table-title">
          <ShieldCheck size={17} />
          
        </div>

        <div className="ur-table-wrapper">

          <table className="ur-table">

            <thead>

              <tr>

                <th className="file-id-col">
                  File ID
                </th>

                <th className="type-col">
                  Type
                </th>

                <th className="short-name-col">
                  Short Name
                </th>

                <th className="check-col">
                  ADD
                </th>

                <th className="check-col">
                  MOD
                </th>

                <th className="check-col">
                  VIEW
                </th>

                <th className="check-col">
                  DEL
                </th>

                <th className="date-col">
                  From Date
                  <span>*</span>
                </th>

                <th className="date-col">
                  To Date
                </th>

                <th className="action-col">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map((row, index) => (

                <tr key={index}>

                  {/* FILE ID */}

                  <td>

                    <div className="ur-input-with-icon">

                      <input
                        type="text"
                        value={row.fileId}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "fileId",
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="ur-cell-search"
                        title="Find File"
                      >
                        <Search size={11} />
                      </button>

                    </div>

                  </td>

                  {/* TYPE */}

                  <td>

                    <input
                      type="text"
                      value={row.type}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "type",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  {/* SHORT NAME */}

                  <td>

                    <input
                      type="text"
                      value={row.shortName}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "shortName",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  {/* ADD */}

                  <td className="checkbox-cell">

                    <input
                      type="checkbox"
                      checked={row.add}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "add",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  {/* MOD */}

                  <td className="checkbox-cell">

                    <input
                      type="checkbox"
                      checked={row.mod}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "mod",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  {/* VIEW */}

                  <td className="checkbox-cell">

                    <input
                      type="checkbox"
                      checked={row.view}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "view",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  {/* DELETE */}

                  <td className="checkbox-cell">

                    <input
                      type="checkbox"
                      checked={row.del}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "del",
                          e.target.checked
                        )
                      }
                    />

                  </td>

                  {/* FROM DATE */}

                  <td>

                    <input
                      type="date"
                      value={row.fromDate}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "fromDate",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  {/* TO DATE */}

                  <td>

                    <input
                      type="date"
                      value={row.toDate}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "toDate",
                          e.target.value
                        )
                      }
                    />

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="ur-actions">

                      {editIndex === index ? (

                        <button
                          type="button"
                          className="ur-save-action"
                          onClick={() =>
                            saveRow(index)
                          }
                          title="Save"
                        >
                          <Save size={13} />
                        </button>

                      ) : (

                        <button
                          type="button"
                          className="ur-edit-action"
                          onClick={() =>
                            editRow(index)
                          }
                          title="Edit"
                        >
                          <Edit size={13} />
                        </button>

                      )}

                      <button
                        type="button"
                        className="ur-delete-action"
                        onClick={() =>
                          deleteRow(index)
                        }
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          BOTTOM BUTTONS
      ================================================= */}

      <div className="ur-bottom-actions">

        <button
          type="button"
          className="ur-bottom-add"
          onClick={addRow}
        >
          <Plus size={15} />
          Add Row
        </button>

        <button
          type="button"
          className="ur-bottom-reset"
          onClick={resetPage}
        >
          <RotateCcw size={15} />
          Reset
        </button>

      </div>

    </div>
  );
}

export default UserRights;