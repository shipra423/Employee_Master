import { useEffect, useState } from "react";

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

const USERS_API_URL =
  "http://localhost:5000/api/users";

const RIGHTS_API_URL =
  "http://localhost:5000/api/user-rights";

// =====================================================
// MENU OPTIONS
// =====================================================

const MENU_OPTIONS = [
   
  {
    value: "employee",
    label: "Employee Master",
  },
  {
    value: "attendance",
    label: "Attendance",
  },
  {
    value: "salary",
    label: "PF / ESI / Salary",
  },
  {
    value: "security",
    label: "Security",
  },
  {
    value: "sev-rights",
    label: "SEV Rights",
  },
];

// =====================================================
// EMPTY ROW
// =====================================================

const createEmptyRow = () => ({
  shortName: "",

  add: false,
  mod: false,
  view: false,
  del: false,

  fromDate: new Date()
    .toISOString()
    .split("T")[0],

  toDate: "",
});

// =====================================================
// CREATE EMPTY ROWS
// =====================================================

const createEmptyRows = () =>
  Array.from(
    { length: 10 },
    () => createEmptyRow()
  );

// =====================================================
// NORMALIZE RIGHTS
// =====================================================

const normalizeRows = (rights = []) => {
  const list = Array.isArray(rights)
    ? rights
    : [];

  const formattedRows = list.map(
    (row) => ({
      ...createEmptyRow(),

      shortName:
        row?.shortName || "",

      add:
        row?.add === true,

      mod:
        row?.mod === true,

      view:
        row?.view === true,

      del:
        row?.del === true,

      fromDate:
        row?.fromDate ||
        new Date()
          .toISOString()
          .split("T")[0],

      toDate:
        row?.toDate || "",
    })
  );

  while (
    formattedRows.length < 10
  ) {
    formattedRows.push(
      createEmptyRow()
    );
  }

  return formattedRows;
};

// =====================================================
// USER RIGHTS
// =====================================================

function UserRights() {
  const [users, setUsers] =
    useState([]);

  const [userId, setUserId] =
    useState("");

  const [userName, setUserName] =
    useState("");

  const [menuOption, setMenuOption] =
    useState("");

  const [privilegeAll, setPrivilegeAll] =
    useState(false);

  const [addAll, setAddAll] =
    useState(false);

  const [modAll, setModAll] =
    useState(false);

  const [viewAll, setViewAll] =
    useState(false);

  const [delAll, setDelAll] =
    useState(false);

  const [copyUserId, setCopyUserId] =
    useState("");

  const [findOption, setFindOption] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [rows, setRows] =
    useState(createEmptyRows());

  const [editMode, setEditMode] =
    useState(false);

  const [editIndex, setEditIndex] =
    useState(null);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [loadingRights, setLoadingRights] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ===================================================
  // LOAD USERS
  // ===================================================

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const response =
        await fetch(
          USERS_API_URL
        );

      const data =
        await response.json();

      console.log(
        "USER MASTER RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load users"
        );
      }

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (
        Array.isArray(data?.users)
      ) {
        list = data.users;
      } else if (
        Array.isArray(data?.data)
      ) {
        list = data.data;
      }

      setUsers(list);
    } catch (error) {
      console.error(
        "LOAD USERS ERROR:",
        error
      );

      setUsers([]);

      setMessage(
        error.message ||
          "Failed to load users"
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // ===================================================
  // LOAD USERS ON PAGE LOAD
  // ===================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // ===================================================
  // UPDATE ALL CHECKBOX STATES
  // ===================================================

  const updateAllCheckboxStates =
    (currentRows) => {

      const activeRows =
        currentRows.filter(
          (row) =>
            String(
              row.shortName || ""
            ).trim() !== ""
        );

      if (
        activeRows.length === 0
      ) {
        setPrivilegeAll(false);
        setAddAll(false);
        setModAll(false);
        setViewAll(false);
        setDelAll(false);

        return;
      }

      const allAdd =
        activeRows.every(
          (row) =>
            row.add === true
        );

      const allMod =
        activeRows.every(
          (row) =>
            row.mod === true
        );

      const allView =
        activeRows.every(
          (row) =>
            row.view === true
        );

      const allDel =
        activeRows.every(
          (row) =>
            row.del === true
        );

      setAddAll(allAdd);
      setModAll(allMod);
      setViewAll(allView);
      setDelAll(allDel);

      setPrivilegeAll(
        allAdd &&
          allMod &&
          allView &&
          allDel
      );
    };

  // ===================================================
  // GET MENU LABEL
  // ===================================================

  const getMenuLabel = (
    menuValue
  ) => {

    const selectedMenu =
      MENU_OPTIONS.find(
        (item) =>
          item.value ===
          menuValue
      );

    return selectedMenu
      ? selectedMenu.label
      : "";
  };

  // ===================================================
  // MENU SELECT
  //
  // IMPORTANT:
  // Menu select karte hi RIGHT TABLE me aa jayega.
  // Edit ki zarurat nahi.
  // ===================================================

  const handleMenuChange = (
    e
  ) => {

    const selectedValue =
      e.target.value;

    setMenuOption(
      selectedValue
    );

    setMessage("");

    if (!selectedValue) {
      return;
    }

    const rightName =
      getMenuLabel(
        selectedValue
      );

    if (!rightName) {
      return;
    }

    setRows(
      (previousRows) => {

        // Pehle check karo right already table
        // me hai ya nahi
        const alreadyExists =
          previousRows.some(
            (row) =>
              String(
                row.shortName || ""
              )
                .trim()
                .toLowerCase() ===
              rightName
                .trim()
                .toLowerCase()
          );

        if (alreadyExists) {
          return previousRows;
        }

        // Pehli empty row find karo
        const emptyIndex =
          previousRows.findIndex(
            (row) =>
              !String(
                row.shortName || ""
              ).trim()
          );

        const newRow = {
          ...createEmptyRow(),
          shortName:
            rightName,
        };

        // Agar empty row mil gayi
        if (
          emptyIndex !== -1
        ) {
          return previousRows.map(
            (row, index) =>
              index ===
              emptyIndex
                ? newRow
                : row
          );
        }

        // Agar saari rows filled hain
        return [
          ...previousRows,
          newRow,
        ];
      }
    );

    setMessage(
      `${rightName} right table me add ho gaya.`
    );
  };

  // ===================================================
  // LOAD SELECTED USER RIGHTS
  // ===================================================

  const loadUserRights =
    async (employeeId) => {

      if (!employeeId) {

        setRows(
          createEmptyRows()
        );

        setMenuOption("");

        setEditMode(false);

        setEditIndex(null);

        return;
      }

      try {

        setLoadingRights(true);

        setMessage("");

        const response =
          await fetch(
            `${RIGHTS_API_URL}/${encodeURIComponent(
              employeeId
            )}`
          );

        const data =
          await response.json();

        console.log(
          "USER RIGHTS RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load rights"
          );
        }

        // =============================================
        // EXISTING RIGHTS
        // =============================================

        if (
          data?.exists === true
        ) {

          const loadedRows =
            normalizeRows(
              data.rights
            );

          setRows(
            loadedRows
          );

          setMenuOption(
            data.menuOption || ""
          );

          if (data.userName) {
            setUserName(
              data.userName
            );
          }

          updateAllCheckboxStates(
            loadedRows
          );

          setEditMode(false);

          setEditIndex(null);

          setMessage(
            "Existing rights loaded successfully."
          );

        } else {

          // =============================================
          // NO RIGHTS
          // =============================================

          const emptyRows =
            createEmptyRows();

          setRows(
            emptyRows
          );

          setMenuOption("");

          updateAllCheckboxStates(
            emptyRows
          );

          setEditMode(false);

          setEditIndex(null);

          setMessage(
            "No existing rights found. Select Menu Option to add right."
          );
        }

      } catch (error) {

        console.error(
          "LOAD RIGHTS ERROR:",
          error
        );

        setRows(
          createEmptyRows()
        );

        setMenuOption("");

        setEditMode(false);

        setEditIndex(null);

        setMessage(
          error.message ||
            "Failed to load rights"
        );

      } finally {

        setLoadingRights(false);

      }
    };

  // ===================================================
  // SELECT USER
  // ===================================================

  const handleUserSelect =
    async (e) => {

      const employeeId =
        e.target.value;

      setUserId(
        employeeId
      );

      setEditMode(false);

      setEditIndex(null);

      setMessage("");

      if (!employeeId) {

        setUserName("");

        setRows(
          createEmptyRows()
        );

        setMenuOption("");

        return;
      }

      const selectedUser =
        users.find(
          (user) =>
            String(
              user?.empId || ""
            ).trim() ===
            String(
              employeeId
            ).trim()
        );

      console.log(
        "SELECTED USER:",
        selectedUser
      );

      if (!selectedUser) {

        setUserName("");

        setRows(
          createEmptyRows()
        );

        setMenuOption("");

        return;
      }

      setUserName(
        selectedUser.userName ||
          selectedUser.name ||
          selectedUser.employeeName ||
          ""
      );

      // Existing rights automatically load
      await loadUserRights(
        employeeId
      );
    };

  // ===================================================
  // ROW CHANGE
  // ===================================================

  const handleRowChange =
    (
      index,
      field,
      value
    ) => {

      if (!editMode) {

        setMessage(
          "Please click Edit first."
        );

        return;
      }

      setRows(
        (previousRows) => {

          const updated =
            previousRows.map(
              (row, i) =>
                i === index
                  ? {
                      ...row,
                      [field]:
                        value,
                    }
                  : row
            );

          updateAllCheckboxStates(
            updated
          );

          return updated;
        }
      );

      setMessage("");
    };

  // ===================================================
  // EDIT
  // ===================================================

  const handleEditRights =
    () => {

      if (!userId) {

        setMessage(
          "Please select User first."
        );

        return;
      }

      // Agar menu selected hai aur uska
      // right table me nahi hai to add karo
      if (menuOption) {

        const rightName =
          getMenuLabel(
            menuOption
          );

        setRows(
          (previousRows) => {

            const alreadyExists =
              previousRows.some(
                (row) =>
                  String(
                    row.shortName || ""
                  )
                    .trim()
                    .toLowerCase() ===
                  rightName
                    .trim()
                    .toLowerCase()
              );

            if (
              alreadyExists
            ) {
              return previousRows;
            }

            const emptyIndex =
              previousRows.findIndex(
                (row) =>
                  !String(
                    row.shortName || ""
                  ).trim()
              );

            const newRow = {
              ...createEmptyRow(),
              shortName:
                rightName,
            };

            if (
              emptyIndex !== -1
            ) {

              return previousRows.map(
                (row, index) =>
                  index ===
                  emptyIndex
                    ? newRow
                    : row
              );

            }

            return [
              ...previousRows,
              newRow,
            ];
          }
        );
      }

      setEditMode(true);

      setMessage(
        `Editing rights for ${userName}`
      );
    };

  // ===================================================
  // SAVE
  // ===================================================

  const handleSaveRights =
    async () => {

      if (!userId) {

        setMessage(
          "Please select User first."
        );

        return;
      }

      if (!menuOption) {

        setMessage(
          "Please select Menu Option."
        );

        return;
      }

      // Check invalid row
      const invalidRow =
        rows.find(
          (row) =>
            !String(
              row.shortName || ""
            ).trim() &&
            (
              row.add ||
              row.mod ||
              row.view ||
              row.del
            )
        );

      if (invalidRow) {

        setMessage(
          "Please enter Short Name for the selected right."
        );

        return;
      }

      try {

        setSaving(true);

        setMessage("");

        // Sirf filled rows save hongi
        const saveRows =
          rows.filter(
            (row) =>
              String(
                row.shortName || ""
              ).trim() !== ""
          );

        const response =
          await fetch(
            RIGHTS_API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  employeeId:
                    userId,

                  userName:
                    userName,

                  menuOption:
                    menuOption,

                  rights:
                    saveRows.map(
                      (row) => ({
                        shortName:
                          row.shortName.trim(),

                        add:
                          Boolean(
                            row.add
                          ),

                        mod:
                          Boolean(
                            row.mod
                          ),

                        view:
                          Boolean(
                            row.view
                          ),

                        del:
                          Boolean(
                            row.del
                          ),

                        fromDate:
                          row.fromDate ||
                          new Date()
                            .toISOString()
                            .split(
                              "T"
                            )[0],

                        toDate:
                          row.toDate ||
                          "",
                      })
                    ),
                }),
            }
          );

        const data =
          await response.json();

        console.log(
          "SAVE RIGHTS RESPONSE:",
          data
        );

        if (!response.ok) {

          throw new Error(
            data?.message ||
              "Failed to save rights"
          );
        }

        setEditMode(false);

        setEditIndex(null);

        setMessage(
          "User rights saved successfully."
        );

        // MongoDB se latest data reload
        await loadUserRights(
          userId
        );

      } catch (error) {

        console.error(
          "SAVE RIGHTS ERROR:",
          error
        );

        setMessage(
          error.message ||
            "Failed to save rights"
        );

      } finally {

        setSaving(false);

      }
    };

  // ===================================================
  // ROW EDIT
  // ===================================================

  const editRow =
    (index) => {

      if (!editMode) {

        setMessage(
          "Please click Edit first."
        );

        return;
      }

      setEditIndex(
        index
      );

      setMessage(
        `Editing row ${index + 1}`
      );
    };

  // ===================================================
  // ROW SAVE
  // ===================================================

  const saveRow =
    (index) => {

      setEditIndex(null);

      setMessage(
        `Row ${index + 1} updated. Click Save above.`
      );
    };

  // ===================================================
  // ADD ROW
  // ===================================================

  const addRow = () => {

    if (!editMode) {

      setMessage(
        "Please click Edit first."
      );

      return;
    }

    setRows(
      (previousRows) => [
        ...previousRows,
        createEmptyRow(),
      ]
    );
  };

  // ===================================================
  // DELETE ROW
  // ===================================================

  const deleteRow =
    (index) => {

      if (!editMode) {

        setMessage(
          "Please click Edit first."
        );

        return;
      }

      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this right?"
        );

      if (!confirmDelete) {
        return;
      }

      setRows(
        (previousRows) => {

          const updated =
            previousRows.filter(
              (_, i) =>
                i !== index
            );

          updateAllCheckboxStates(
            updated
          );

          return updated;
        }
      );

      setMessage(
        "Right deleted successfully."
      );
    };

  // ===================================================
  // PRIVILEGE ALL
  // ===================================================

  const handlePrivilegeAll =
    (checked) => {

      if (!editMode) {

        setMessage(
          "Please click Edit first."
        );

        return;
      }

      setPrivilegeAll(
        checked
      );

      setAddAll(
        checked
      );

      setModAll(
        checked
      );

      setViewAll(
        checked
      );

      setDelAll(
        checked
      );

      setRows(
        (previousRows) =>
          previousRows.map(
            (row) => ({
              ...row,

              add: checked,

              mod: checked,

              view: checked,

              del: checked,
            })
          )
      );
    };

  // ===================================================
  // COLUMN ALL
  // ===================================================

  const handleColumnAll =
    (
      field,
      checked
    ) => {

      if (!editMode) {

        setMessage(
          "Please click Edit first."
        );

        return;
      }

      setRows(
        (previousRows) => {

          const updated =
            previousRows.map(
              (row) => ({
                ...row,

                [field]:
                  checked,
              })
            );

          updateAllCheckboxStates(
            updated
          );

          return updated;
        }
      );
    };

  // ===================================================
  // COPY USER
  // ===================================================

  const handleCopyUser =
    async () => {

      if (!userId) {

        setMessage(
          "Please select target User first."
        );

        return;
      }

      if (!copyUserId) {

        setMessage(
          "Please select Copy User."
        );

        return;
      }

      if (
        copyUserId ===
        userId
      ) {

        setMessage(
          "Source and target user cannot be same."
        );

        return;
      }

      try {

        const response =
          await fetch(
            `${RIGHTS_API_URL}/${encodeURIComponent(
              copyUserId
            )}`
          );

        const data =
          await response.json();

        if (!response.ok) {

          throw new Error(
            data?.message ||
              "Failed to load copy user rights."
          );
        }

        if (
          !data?.exists ||
          !Array.isArray(
            data.rights
          ) ||
          data.rights.length === 0
        ) {

          setMessage(
            "No rights found for Copy User."
          );

          return;
        }

        const copiedRows =
          normalizeRows(
            data.rights
          );

        setRows(
          copiedRows
        );

        setMenuOption(
          data.menuOption || ""
        );

        updateAllCheckboxStates(
          copiedRows
        );

        setEditMode(true);

        setMessage(
          "Rights copied. Click Save."
        );

      } catch (error) {

        console.error(
          "COPY RIGHTS ERROR:",
          error
        );

        setMessage(
          error.message ||
            "Failed to copy rights."
        );
      }
    };

  // ===================================================
  // RESET
  // ===================================================

  const resetPage = () => {

    setUserId("");

    setUserName("");

    setCopyUserId("");

    setMenuOption("");

    setFindOption("");

    setSearchText("");

    setPrivilegeAll(false);

    setAddAll(false);

    setModAll(false);

    setViewAll(false);

    setDelAll(false);

    setRows(
      createEmptyRows()
    );

    setEditMode(false);

    setEditIndex(null);

    setMessage("");
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="user-rights-page">

      {/* ================= HEADER ================= */}

      <div className="user-rights-header">

        <div className="user-rights-title">

          <div className="user-rights-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h1>
              User Rights
            </h1>
          </div>

        </div>

        <div className="user-rights-header-actions">

          {/* EDIT */}

          <button
            type="button"
            className="ur-btn ur-btn-add"
            onClick={
              handleEditRights
            }
            disabled={
              !userId ||
              loadingRights
            }
          >
            <Edit size={15} />

            {editMode
              ? "Editing"
              : "Edit"}
          </button>

          {/* SAVE */}

          <button
            type="button"
            className="ur-btn ur-btn-save"
            onClick={
              handleSaveRights
            }
            disabled={
              !userId ||
              !editMode ||
              saving
            }
          >
            <Save size={15} />

            {saving
              ? "Saving..."
              : "Save"}
          </button>

          {/* RESET */}

          <button
            type="button"
            className="ur-btn ur-btn-reset"
            onClick={
              resetPage
            }
          >
            <RotateCcw
              size={15}
            />

            Reset
          </button>

        </div>

      </div>

      {/* ================= TOP PANEL ================= */}

      <div className="user-rights-control-panel">

        {/* USER */}

        <div className="ur-control-group">

          <label>
            User Name
          </label>

          <select
            className="ur-user-select"
            value={userId}
            onChange={
              handleUserSelect
            }
            disabled={
              loadingUsers
            }
          >

            <option value="">
              {loadingUsers
                ? "Loading Users..."
                : "Select User"}
            </option>

            {users.map(
              (user) => {

                const empId =
                  user?.empId ||
                  "";

                const name =
                  user?.userName ||
                  user?.name ||
                  user?.employeeName ||
                  "";

                if (!empId) {
                  return null;
                }

                return (
                  <option
                    key={
                      user._id ||
                      empId
                    }
                    value={
                      empId
                    }
                  >
                    {empId} -{" "}
                    {name}
                  </option>
                );
              }
            )}

          </select>

          <input
            className="ur-small-input"
            type="text"
            value={userId}
            readOnly
            placeholder="Employee ID"
          />

          <button
            type="button"
            className="ur-icon-btn"
            title="Reload Users"
            onClick={
              loadUsers
            }
          >
            <Search size={14} />
          </button>

        </div>

        {/* COPY USER */}

        <div className="ur-copy-group">

          <label>
            Copy User
          </label>

          <select
            value={
              copyUserId
            }
            onChange={(e) =>
              setCopyUserId(
                e.target.value
              )
            }
          >

            <option value="">
              Select User
            </option>

            {users
              .filter(
                (user) =>
                  String(
                    user?.empId ||
                      ""
                  ) !==
                  String(
                    userId
                  )
              )
              .map(
                (user) => {

                  const empId =
                    user?.empId ||
                    "";

                  const name =
                    user?.userName ||
                    user?.name ||
                    user?.employeeName ||
                    "";

                  if (!empId) {
                    return null;
                  }

                  return (
                    <option
                      key={
                        `copy-${
                          user._id ||
                          empId
                        }`
                      }
                      value={
                        empId
                      }
                    >
                      {empId} -{" "}
                      {name}
                    </option>
                  );
                }
              )}

          </select>

          <button
            type="button"
            className="ur-copy-btn"
            onClick={
              handleCopyUser
            }
          >
            <Copy size={14} />
            Copy
          </button>

        </div>

        {/* MENU + PRIVILEGE */}

        <div className="ur-control-row">

          {/* MENU */}

          <div className="ur-field">

            <label>
              Menu Options
            </label>

            <select
              value={
                menuOption
              }
              onChange={
                handleMenuChange
              }

              /*
               * IMPORTANT:
               * Pehle yahan disabled={!editMode} tha.
               * Ab menu Edit se pehle bhi select hoga.
               */
              disabled={
                !userId ||
                loadingRights
              }
            >

              <option value="">
                Select Option
              </option>

              {MENU_OPTIONS.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {option.label}
                  </option>
                )
              )}

            </select>

          </div>

          {/* PRIVILEGE */}

          <div className="ur-privilege">

            <label>
              Privilege
            </label>

            <div className="ur-check-item">

              <input
                type="checkbox"
                checked={
                  privilegeAll
                }
                disabled={
                  !editMode
                }
                onChange={(e) =>
                  handlePrivilegeAll(
                    e.target.checked
                  )
                }
              />

              <span>
                All
              </span>

            </div>

            <div className="ur-column-checks">

              <label>

                <input
                  type="checkbox"
                  checked={
                    addAll
                  }
                  disabled={
                    !editMode
                  }
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
                  checked={
                    modAll
                  }
                  disabled={
                    !editMode
                  }
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
                  checked={
                    viewAll
                  }
                  disabled={
                    !editMode
                  }
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
                  checked={
                    delAll
                  }
                  disabled={
                    !editMode
                  }
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

        </div>

      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="ur-message">

          <span>
            {message}
          </span>

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

      {/* ================= LOADING ================= */}

      {loadingRights && (
        <div className="ur-message">
          Loading existing rights...
        </div>
      )}

      {/* ================= TABLE ================= */}

      <div className="ur-table-card">

        <div className="ur-table-title">

          <ShieldCheck size={17} />

          {userId
            ? `${userId} - ${userName}`
            : "User Rights"}

        </div>

        <div className="ur-table-wrapper">

          <table className="ur-table">

            <thead>

              <tr>

                <th>
                  Short Name
                </th>

                <th>
                  ADD
                </th>

                <th>
                  MOD
                </th>

                <th>
                  VIEW
                </th>

                <th>
                  DEL
                </th>

                <th>
                  From Date *
                </th>

                <th>
                  To Date
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map(
                (row, index) => (

                  <tr
                    key={index}
                  >

                    {/* SHORT NAME */}

                    <td>

                      <input
                        type="text"
                        value={
                          row.shortName
                        }
                        disabled={
                          !editMode
                        }
                        placeholder="Right Name"
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
                        checked={
                          row.add ===
                          true
                        }
                        disabled={
                          !editMode
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "add",
                            e.target
                              .checked
                          )
                        }
                      />

                    </td>

                    {/* MOD */}

                    <td className="checkbox-cell">

                      <input
                        type="checkbox"
                        checked={
                          row.mod ===
                          true
                        }
                        disabled={
                          !editMode
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "mod",
                            e.target
                              .checked
                          )
                        }
                      />

                    </td>

                    {/* VIEW */}

                    <td className="checkbox-cell">

                      <input
                        type="checkbox"
                        checked={
                          row.view ===
                          true
                        }
                        disabled={
                          !editMode
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "view",
                            e.target
                              .checked
                          )
                        }
                      />

                    </td>

                    {/* DEL */}

                    <td className="checkbox-cell">

                      <input
                        type="checkbox"
                        checked={
                          row.del ===
                          true
                        }
                        disabled={
                          !editMode
                        }
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "del",
                            e.target
                              .checked
                          )
                        }
                      />

                    </td>

                    {/* FROM DATE */}

                    <td>

                      <input
                        type="date"
                        value={
                          row.fromDate ||
                          ""
                        }
                        disabled={
                          !editMode
                        }
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
                        value={
                          row.toDate ||
                          ""
                        }
                        disabled={
                          !editMode
                        }
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

                        {editIndex ===
                        index ? (

                          <button
                            type="button"
                            className="ur-save-action"
                            onClick={() =>
                              saveRow(
                                index
                              )
                            }
                          >
                            <Save
                              size={13}
                            />
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="ur-edit-action"
                            onClick={() =>
                              editRow(
                                index
                              )
                            }
                            disabled={
                              !editMode
                            }
                          >
                            <Edit
                              size={13}
                            />
                          </button>

                        )}

                        <button
                          type="button"
                          className="ur-delete-action"
                          onClick={() =>
                            deleteRow(
                              index
                            )
                          }
                          disabled={
                            !editMode
                          }
                        >
                          <Trash2
                            size={13}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= BOTTOM ACTIONS ================= */}

      <div className="ur-bottom-actions">

        <button
          type="button"
          className="ur-bottom-add"
          onClick={
            addRow
          }
          disabled={
            !editMode
          }
        >
          <Plus size={15} />
          Add Right
        </button>

        <button
          type="button"
          className="ur-bottom-reset"
          onClick={
            resetPage
          }
        >
          <RotateCcw
            size={15}
          />
          Reset
        </button>

      </div>

    </div>
  );
}

export default UserRights;