import { useEffect, useState } from "react";

import {
  UserRound,
  Building2,
  Hash,
  User,
  CalendarDays,
  CreditCard,
  Phone,
  Mail,
  Factory,
  Clock3,
  BriefcaseBusiness,
  UsersRound,
  Search,
  Plus,
  Save,
  RotateCcw,
  Trash2,
  Edit,
  AlertCircle,
} from "lucide-react";

import {
  allowNumbersOnly,
  allowAlphabetsOnly,
  allowName,
  allowEmailCharacters,
  allowMobileNumber,
  allowAadharNumber,
  allowAlphaNumeric,
} from "../utils/validation";

const API_URL = "http://localhost:5000/api/employees";

function EmployeeMaster() {
  // =====================================================
  // TODAY DATE
  // =====================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // EMPTY FORM
  // =====================================================

  const emptyForm = {
    unitCode: "",
    employeeCode: "",
    employeeName: "",
    fatherName: "",
    dob: "",
    aadhar: "",
    contactNo: "",
    mailId: "",
    departmentCode: "",
    contractorCode: "",
    assignedShift: "",
    designation: "",
    category: "",
    reportingPerson: "",

    // NEW DATE FIELDS
    joiningDate: "",
    resignDate: "",
    creationDate: getTodayDate(),
  };

  const [formData, setFormData] = useState(emptyForm);

  const [employees, setEmployees] = useState([]);

  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportingPersons, setReportingPersons] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  const loadEmployees = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load employees");
      }

      const data = await response.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee data.");
    }
  };

  // =====================================================
  // LOAD MASTER DATA
  // =====================================================

  const loadMasterData = async () => {
    try {
      const [
        unitResponse,
        departmentResponse,
        contractorResponse,
        shiftResponse,
        designationResponse,
        categoryResponse,
        reportingResponse,
      ] = await Promise.all([
        fetch("http://localhost:5000/api/units"),
        fetch("http://localhost:5000/api/departments"),
        fetch("http://localhost:5000/api/contractors"),
        fetch("http://localhost:5000/api/shifts"),
        fetch("http://localhost:5000/api/designations"),
        fetch("http://localhost:5000/api/categories"),
        fetch("http://localhost:5000/api/reporting-persons"),
      ]);

      if (unitResponse.ok) {
        const data = await unitResponse.json();
        setUnits(Array.isArray(data) ? data : []);
      }

      if (departmentResponse.ok) {
        const data = await departmentResponse.json();
        setDepartments(Array.isArray(data) ? data : []);
      }

      if (contractorResponse.ok) {
        const data = await contractorResponse.json();
        setContractors(Array.isArray(data) ? data : []);
      }

      if (shiftResponse.ok) {
        const data = await shiftResponse.json();
        setShifts(Array.isArray(data) ? data : []);
      }

      if (designationResponse.ok) {
        const data = await designationResponse.json();
        setDesignations(Array.isArray(data) ? data : []);
      }

      if (categoryResponse.ok) {
        const data = await categoryResponse.json();
        setCategories(Array.isArray(data) ? data : []);
      }

      if (reportingResponse.ok) {
        const data = await reportingResponse.json();
        setReportingPersons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Master data loading error:", err);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadEmployees();
    loadMasterData();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let finalValue = value;

    // EMPLOYEE CODE
    if (name === "employeeCode") {
      finalValue = allowAlphaNumeric(value);
    }

    // EMPLOYEE NAME
    if (name === "employeeName") {
      finalValue = allowName(value);
    }

    // FATHER NAME
    if (name === "fatherName") {
      finalValue = allowName(value);
    }

    // AADHAAR
    if (name === "aadhar") {
      finalValue = allowAadharNumber(value);
    }

    // CONTACT
    if (name === "contactNo") {
      finalValue = allowMobileNumber(value);
    }

    // EMAIL
    if (name === "mailId") {
      finalValue = allowEmailCharacters(value);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: finalValue,
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
  // ADD NEW
  // =====================================================

  const handleAdd = () => {
    setFormData({
      ...emptyForm,
      creationDate: getTodayDate(),
    });

    setEditingId(null);
    setMessage("");
    setError("");
    setSearchText("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!formData.employeeCode.trim()) {
      setError("Employee Code is required.");
      return false;
    }

    if (!formData.employeeName.trim()) {
      setError("Employee Name is required.");
      return false;
    }

    if (!formData.departmentCode.trim()) {
      setError("Department is required.");
      return false;
    }

    if (formData.aadhar && formData.aadhar.length !== 12) {
      setError("Aadhaar number must contain exactly 12 digits.");
      return false;
    }

    if (formData.contactNo && formData.contactNo.length !== 10) {
      setError("Contact number must contain exactly 10 digits.");
      return false;
    }

    if (
      formData.mailId &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mailId)
    ) {
      setError("Please enter a valid email address.");
      return false;
    }

    // JOINING DATE / RESIGN DATE CHECK
    if (
      formData.joiningDate &&
      formData.resignDate &&
      formData.resignDate < formData.joiningDate
    ) {
      setError("Resign Date cannot be before Joining Date.");
      return false;
    }

    return true;
  };

  // =====================================================
  // SAVE / UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!validateForm()) {
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save employee."
        );
      }

      setMessage(
        editingId
          ? "Employee updated successfully!"
          : "Employee saved successfully!"
      );

      setFormData(emptyForm);
      setEditingId(null);

      await loadEmployees();
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to save employee."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (employee) => {
    setEditingId(employee._id);

    setFormData({
      unitCode: employee.unitCode || "",
      employeeCode: employee.employeeCode || "",
      employeeName: employee.employeeName || "",
      fatherName: employee.fatherName || "",

      dob: employee.dob
        ? new Date(employee.dob)
            .toISOString()
            .split("T")[0]
        : "",

      aadhar: employee.aadhar || "",
      contactNo: employee.contactNo || "",
      mailId: employee.mailId || "",

      departmentCode: employee.departmentCode || "",
      contractorCode: employee.contractorCode || "",
      assignedShift: employee.assignedShift || "",
      designation: employee.designation || "",
      category: employee.category || "",
      reportingPerson: employee.reportingPerson || "",

      // NEW DATE FIELDS
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate)
            .toISOString()
            .split("T")[0]
        : "",

      resignDate: employee.resignDate
        ? new Date(employee.resignDate)
            .toISOString()
            .split("T")[0]
        : "",

      creationDate: employee.creationDate
        ? new Date(employee.creationDate)
            .toISOString()
            .split("T")[0]
        : getTodayDate(),
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete employee."
        );
      }

      setMessage("Employee deleted successfully!");

      await loadEmployees();
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Failed to delete employee."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const search = searchText.toLowerCase().trim();

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.employeeCode
        ?.toLowerCase()
        .includes(search) ||
      employee.employeeName
        ?.toLowerCase()
        .includes(search) ||
      employee.departmentCode
        ?.toLowerCase()
        .includes(search) ||
      employee.contactNo
        ?.toLowerCase()
        .includes(search)
  );

  // =====================================================
  // MASTER OPTION HELPERS
  // =====================================================

  const getUnitValue = (item) =>
    item.unitCode || item.code || item.name || "";

  const getDepartmentValue = (item) =>
    item.departmentCode ||
    item.departmentName ||
    item.name ||
    "";

  const getContractorValue = (item) =>
    item.contractorCode ||
    item.contractorName ||
    item.name ||
    "";

  const getShiftValue = (item) =>
    item.shiftCode ||
    item.shiftName ||
    item.name ||
    "";

  const getDesignationValue = (item) =>
    item.designationCode ||
    item.designationName ||
    item.name ||
    "";

  const getCategoryValue = (item) =>
    item.categoryCode ||
    item.categoryName ||
    item.name ||
    "";

  const getReportingValue = (item) =>
    item.reportingPersonCode ||
    item.reportingPersonName ||
    item.name ||
    "";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="employee-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="page-header">
        <div>
          <h1>Employee Master</h1>
        </div>
      </div>

      {/* =========================================
          TOOLBAR
      ========================================= */}

      <div className="employee-toolbar">

        <div className="employee-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search employee..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

          {searchText && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchText("")}
            >
              <Trash2 size={15} />
            </button>
          )}

        </div>

        <button
          type="button"
          className="add-employee-btn"
          onClick={handleAdd}
        >
          <Plus size={18} />
          Add Employee
        </button>

      </div>

      {/* =========================================
          FORM
      ========================================= */}

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        <div className="section-title">

          <UserRound size={21} />

          <div>
            <h2>
              {editingId
                ? "Edit Employee"
                : "Employee Details"}
            </h2>
          </div>

        </div>

        {/* =====================================
            3 COLUMN FORM
        ===================================== */}

        <div className="form-grid">

          {/* UNIT */}

          <div className="form-group">

            <label>
              <Building2 size={17} />
              Unit
            </label>

            <select
              name="unitCode"
              value={formData.unitCode}
              onChange={handleChange}
            >

              <option value="">
                Select unit
              </option>

              {units.map((unit) => {

                const value = getUnitValue(unit);

                return (
                  <option
                    key={unit._id || value}
                    value={value}
                  >
                    {unit.unitName
                      ? `${value} - ${unit.unitName}`
                      : value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* EMPLOYEE CODE */}

          <div className="form-group">

            <label>
              <Hash size={17} />
              Employee Code
              <span className="required-star">
                *
              </span>
            </label>

            <input
              type="text"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              placeholder="Enter employee code"
            />

          </div>

          {/* EMPLOYEE NAME */}

          <div className="form-group">

            <label>
              <User size={17} />
              Employee Name
              <span className="required-star">
                *
              </span>
            </label>

            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              placeholder="Enter employee name"
            />

          </div>

          {/* FATHER NAME */}

          <div className="form-group">

            <label>
              <User size={17} />
              Father Name
            </label>

            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father name"
            />

          </div>

          {/* DOB */}

          <div className="form-group">

            <label>
              <CalendarDays size={17} />
              Date of Birth
            </label>

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />

          </div>

          {/* AADHAAR */}

          <div className="form-group">

            <label>
              <CreditCard size={17} />
              Aadhaar Number
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={12}
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              placeholder="12 digit Aadhaar"
            />

          </div>

          {/* CONTACT */}

          <div className="form-group">

            <label>
              <Phone size={17} />
              Contact Number
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              name="contactNo"
              value={formData.contactNo}
              onChange={handleChange}
              placeholder="10 digit mobile number"
            />

          </div>

          {/* EMAIL */}

          <div className="form-group">

            <label>
              <Mail size={17} />
              Email
            </label>

            <input
              type="text"
              name="mailId"
              value={formData.mailId}
              onChange={handleChange}
              placeholder="Enter email address"
            />

          </div>

          {/* DEPARTMENT */}

          <div className="form-group">

            <label>
              <Factory size={17} />
              Department
              <span className="required-star">
                *
              </span>
            </label>

            <select
              name="departmentCode"
              value={formData.departmentCode}
              onChange={handleChange}
            >

              <option value="">
                Select department
              </option>

              {departments.map((item) => {

                const value =
                  getDepartmentValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* CONTRACTOR */}

          <div className="form-group">

            <label>
              <Building2 size={17} />
              Contractor
            </label>

            <select
              name="contractorCode"
              value={formData.contractorCode}
              onChange={handleChange}
            >

              <option value="">
                Select contractor
              </option>

              {contractors.map((item) => {

                const value =
                  getContractorValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* SHIFT */}

          <div className="form-group">

            <label>
              <Clock3 size={17} />
              Assigned Shift
            </label>

            <select
              name="assignedShift"
              value={formData.assignedShift}
              onChange={handleChange}
            >

              <option value="">
                Select shift
              </option>

              {shifts.map((item) => {

                const value =
                  getShiftValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* DESIGNATION */}

          <div className="form-group">

            <label>
              <BriefcaseBusiness size={17} />
              Designation
            </label>

            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
            >

              <option value="">
                Select designation
              </option>

              {designations.map((item) => {

                const value =
                  getDesignationValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* CATEGORY */}

          <div className="form-group">

            <label>
              <UsersRound size={17} />
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >

              <option value="">
                Select category
              </option>

              {categories.map((item) => {

                const value =
                  getCategoryValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* REPORTING PERSON */}

          <div className="form-group">

            <label>
              <UserRound size={17} />
              Reporting Person
            </label>

            <select
              name="reportingPerson"
              value={formData.reportingPerson}
              onChange={handleChange}
            >

              <option value="">
                Select reporting person
              </option>

              {reportingPersons.map((item) => {

                const value =
                  getReportingValue(item);

                return (
                  <option
                    key={item._id || value}
                    value={value}
                  >
                    {value}
                  </option>
                );

              })}

            </select>

          </div>

          {/* =====================================
              JOINING DATE
          ===================================== */}

          <div className="form-group">

            <label>
              <CalendarDays size={17} />
              Joining Date
            </label>

            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleChange}
            />

          </div>

          {/* =====================================
              RESIGN DATE
          ===================================== */}

          <div className="form-group">

            <label>
              <CalendarDays size={17} />
              Resign Date
            </label>

            <input
              type="date"
              name="resignDate"
              value={formData.resignDate}
              onChange={handleChange}
            />

          </div>

          {/* =====================================
              CREATION DATE
          ===================================== */}

          <div className="form-group">

            <label>
              <CalendarDays size={17} />
              Creation Date
            </label>

            <input
              type="date"
              name="creationDate"
              value={formData.creationDate}
              onChange={handleChange}
            />

          </div>

        </div>

        {/* =====================================
            MESSAGE
        ===================================== */}

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

        {/* =====================================
            BUTTONS
        ===================================== */}

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
              ? "Update Employee"
              : "Save Employee"}
          </button>

        </div>

      </form>

      {/* =========================================
          SEARCH RESULTS
      ========================================= */}

      {searchText.trim() && (

        <div className="employee-search-results">

          <div className="search-results-header">

            <strong>
              Employee Search Results
            </strong>

            <span>
              {filteredEmployees.length} record(s)
            </span>

          </div>

          {filteredEmployees.length === 0 ? (

            <div className="no-search-result">
              No employee found.
            </div>

          ) : (

            <div className="employee-results-table">

              <table>

                <thead>

                  <tr>
                    <th>Employee Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredEmployees.map(
                    (employee) => (

                      <tr key={employee._id}>

                        <td>
                          {employee.employeeCode}
                        </td>

                        <td>
                          {employee.employeeName}
                        </td>

                        <td>
                          {employee.departmentCode}
                        </td>

                        <td>
                          {employee.contactNo || "-"}
                        </td>

                        <td>

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(employee)
                            }
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                employee._id
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={15} />
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

export default EmployeeMaster;