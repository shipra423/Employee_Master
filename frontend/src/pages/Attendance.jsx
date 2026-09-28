
import { useEffect, useState } from "react";

import {
  Factory,
  Clock3,
  CalendarDays,
  Upload,
  Search,
  RotateCcw,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";

function Attendance() {

  // =====================================================
  // STATES
  // =====================================================

  const [department, setDepartment] = useState("");
  const [shift, setShift] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");

  const [excelFile, setExcelFile] = useState(null);

  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =====================================================
  // BACKEND URL
  // =====================================================

  const API_URL =
    "http://localhost:5000/api/attendance";


  // =====================================================
  // FETCH ATTENDANCE
  // =====================================================

  const fetchAttendance = async () => {

    try {

      setLoading(true);
      setError("");

      const params =
        new URLSearchParams();

      if (department) {
        params.append(
          "department",
          department
        );
      }

      if (shift) {
        params.append(
          "shift",
          shift
        );
      }

      if (attendanceDate) {
        params.append(
          "attendanceDate",
          attendanceDate
        );
      }

      if (employeeCode) {
        params.append(
          "employeeCode",
          employeeCode
        );
      }


      const response =
        await fetch(
          `${API_URL}?${params.toString()}`
        );


      if (!response.ok) {
        throw new Error(
          "Failed to fetch attendance"
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

      console.error(err);

      setError(
        "Unable to load attendance records"
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchAttendance();

  }, []);


  // =====================================================
  // APPLY FILTER
  // =====================================================

  const handleSearch = () => {

    fetchAttendance();

  };


  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleReset = () => {

    setDepartment("");
    setShift("");
    setAttendanceDate("");
    setEmployeeCode("");
    setExcelFile(null);
    setMessage("");
    setError("");

    fetchAttendance();

  };


  // =====================================================
  // EXCEL FILE SELECT
  // =====================================================

  const handleFileChange = (event) => {

    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    setExcelFile(file);
    setMessage("");
    setError("");

  };


  // =====================================================
  // UPLOAD EXCEL
  // =====================================================

  const handleUpload = async () => {

    if (!excelFile) {

      setError(
        "Please select an Excel file first."
      );

      return;
    }


    try {

      setUploading(true);
      setMessage("");
      setError("");


      const formData =
        new FormData();

      formData.append(
        "file",
        excelFile
      );


      const response =
        await fetch(
          `${API_URL}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Excel upload failed"
        );

      }


      setMessage(
        `Excel uploaded successfully. ${data.totalRecords || 0} records saved.`
      );


      setExcelFile(null);


      // Refresh records
      await fetchAttendance();


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Excel upload failed"
      );

    } finally {

      setUploading(false);

    }
  };


  // =====================================================
  // DELETE RECORD
  // =====================================================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this attendance record?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      setError("");
      setMessage("");


      const response =
        await fetch(
          `${API_URL}/${id}`,
          {
            method: "DELETE",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Delete failed"
        );

      }


      setMessage(
        "Attendance record deleted successfully."
      );


      await fetchAttendance();


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to delete record"
      );

    }
  };


  // =====================================================
  // GET DYNAMIC EXCEL COLUMNS
  // =====================================================

  const getExcelColumns = () => {

    const columns = new Set();


    records.forEach((record) => {

      if (
        record.excelData &&
        typeof record.excelData === "object"
      ) {

        Object.keys(
          record.excelData
        ).forEach((column) => {

          columns.add(column);

        });

      }

    });


    return Array.from(columns);

  };


  const excelColumns =
    getExcelColumns();


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDisplayDate = (value) => {

    if (!value) {
      return "-";
    }


    const date =
      new Date(value);


    if (isNaN(date.getTime())) {
      return value;
    }


    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");


    const year =
      date.getFullYear();


    return `${day}-${month}-${year}`;

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="employee-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <h1>
            Department-wise Attendance
          </h1>

          

        </div>


        <div className="form-badge">
          Form 2 of 3
        </div>

      </div>


      {/* =================================================
          STEP INDICATOR
      ================================================= */}

      <div className="step-card">

        <div className="step">

          <span>1</span>

          <div>

            <strong>
              Employee Details
            </strong>

            <small>
              Basic information
            </small>

          </div>

        </div>


        <div className="step-line"></div>


        <div className="step active">

          <span>2</span>

          <div>

            <strong>
              Attendance
            </strong>

            <small>
              Department wise
            </small>

          </div>

        </div>


        <div className="step-line"></div>


        <div className="step">

          <span>3</span>

          <div>

            <strong>
              PF / ESI
            </strong>

            <small>
              Salary details
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTER / UPLOAD CARD
      ================================================= */}

      <div className="form-card">

        <div className="section-title">

          <CalendarDays size={21} />

          <div>

            
         

          </div>

        </div>


        <div className="form-grid">

          {/* Department */}

          <div className="form-group">

            <label>

              <Factory size={17} />

              Department

            </label>


            <select
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
            >

              <option value="">
                All Departments
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

              <option value="Stores">
                Stores
              </option>

            </select>

          </div>


          {/* Shift */}

          <div className="form-group">

            <label>

              <Clock3 size={17} />

              Shift

            </label>


            <select
              value={shift}
              onChange={(e) =>
                setShift(
                  e.target.value
                )
              }
            >

              <option value="">
                All Shifts
              </option>

              <option value="A">
                Shift A
              </option>

              <option value="B">
                Shift B
              </option>

              <option value="C">
                Shift C
              </option>

              <option value="General">
                General
              </option>

            </select>

          </div>


          {/* Date */}

          <div className="form-group">

            <label>

              <CalendarDays size={17} />

              Attendance Date

            </label>


            <input
              type="date"
              value={attendanceDate}
              onChange={(e) =>
                setAttendanceDate(
                  e.target.value
                )
              }
            />

          </div>


          {/* Excel Upload */}

          <div className="form-group">

            <label>

              <FileSpreadsheet size={17} />

              Attendance Excel

            </label>


            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={
                handleFileChange
              }
            />

          </div>

        </div>


        {/* Buttons */}

        <div className="form-actions">

          <button
            className="clear-btn"
            onClick={
              handleReset
            }
            type="button"
          >

            <RotateCcw size={17} />

            Reset

          </button>


          <button
            className="clear-btn"
            onClick={
              handleSearch
            }
            type="button"
          >

            <Search size={17} />

            Apply Filter

          </button>


          <button
            className="next-btn"
            onClick={
              handleUpload
            }
            disabled={
              uploading
            }
            type="button"
          >

            <Upload size={17} />

            {uploading
              ? "Uploading..."
              : "Upload Excel"}

          </button>

        </div>


        {/* Messages */}

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

      </div>


      {/* =================================================
          ATTENDANCE TABLE
      ================================================= */}

      <div className="form-card attendance-table-card">

        <div className="section-title">

          <Search size={21} />

          <div>

            <h2>
              Attendance Records
            </h2>

            

          </div>

        </div>


        {/* Search */}

        <div className="attendance-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search employee code..."
            value={employeeCode}
            onChange={(e) =>
              setEmployeeCode(
                e.target.value
              )
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {

                handleSearch();

              }

            }}
          />

        </div>


        {/* Table */}

        <div className="table-wrapper">

          {loading ? (

            <div className="table-message">
              Loading attendance records...
            </div>

          ) : records.length === 0 ? (

            <div className="table-message">
              No attendance records found.
            </div>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Employee Code
                  </th>

                  <th>
                    Employee Name
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Shift
                  </th>

                  <th>
                    In Time
                  </th>

                  <th>
                    Out Time
                  </th>

                  <th>
                    Status
                  </th>


                  {/* Dynamic Excel columns */}

                  {excelColumns.map(
                    (column) => (

                      <th
                        key={column}
                      >
                        {column}
                      </th>

                    )
                  )}


                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {records.map(
                  (record) => (

                    <tr
                      key={
                        record._id
                      }
                    >

                      <td>
                        {formatDisplayDate(
                          record.attendanceDate
                        )}
                      </td>


                      <td>
                        {
                          record.employeeCode ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          record.employeeName ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          record.department ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          record.shift ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          record.inTime ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          record.outTime ||
                          "-"
                        }
                      </td>


                      <td>

                        {record.status ===
                        "P" ? (

                          <span className="status-present">
                            P
                          </span>

                        ) : (

                          <span className="status-absent">
                            A
                          </span>

                        )}

                      </td>


                      {/* Dynamic Excel data */}

                      {excelColumns.map(
                        (column) => (

                          <td
                            key={
                              `${record._id}-${column}`
                            }
                          >

                            {record.excelData &&
                            record.excelData[
                              column
                            ] !==
                              undefined
                              ? String(
                                  record
                                    .excelData[
                                      column
                                    ]
                                )
                              : "-"}

                          </td>

                        )
                      )}


                      <td>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              record._id
                            )
                          }
                          title="Delete"
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );
}

export default Attendance;

