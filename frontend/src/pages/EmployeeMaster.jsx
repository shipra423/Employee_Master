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
  Edit,
  AlertCircle,
  Camera,
  FileText,
  ChevronDown,
} from "lucide-react";

import {
  allowName,
  allowEmailCharacters,
  allowMobileNumber,
  allowAadharNumber,
  allowAlphaNumeric,
} from "../utils/validation";


// =====================================================
// API
// =====================================================

const API_URL =
  "http://localhost:5000/api/employees";

const MEDIA_API_URL =
  "http://localhost:5000/api/employee-media";

const BACKEND_URL =
  "http://localhost:5000";


// =====================================================
// COMPONENT
// =====================================================

function EmployeeMaster({
  onBankDetail,
  onQualification,
}) {

  // =====================================================
  // TODAY DATE
  // =====================================================

  const getTodayDate = () => {

    const today = new Date();

    const year =
      today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  // =====================================================
  // DATE FOR INPUT
  // =====================================================

  const getInputDate = (date) => {

    if (!date) {
      return "";
    }

    if (
      typeof date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

    const d =
      new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    const year =
      d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      d.getDate()
    ).padStart(2, "0");

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

    joiningDate: "",

    resignDate: "",

    creationDate:
      getTodayDate(),
  };


  // =====================================================
  // FORM STATES
  // =====================================================

  const [formData, setFormData] =
    useState(emptyForm);

  const [employees, setEmployees] =
    useState([]);

  const [units, setUnits] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [contractors, setContractors] =
    useState([]);

  const [shifts, setShifts] =
    useState([]);

  const [designations, setDesignations] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [reportingPersons, setReportingPersons] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // PHOTO STATES
  // =====================================================

  const [mediaEmployeeCode, setMediaEmployeeCode] =
    useState("");

  const [photoUrl, setPhotoUrl] =
    useState("");

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [photoFile, setPhotoFile] =
    useState(null);


  // =====================================================
  // DOCUMENT STATES
  // =====================================================

  const [documents, setDocuments] =
    useState([]);

  const [documentFile, setDocumentFile] =
    useState(null);

  const [documentName, setDocumentName] =
    useState("");

  const [documentsOpen, setDocumentsOpen] =
    useState(false);

  const [mediaLoading, setMediaLoading] =
    useState(false);


  // =====================================================
  // LOAD EMPLOYEES
  // =====================================================

  const loadEmployees = async () => {

    try {

      const response =
        await fetch(API_URL);

      if (!response.ok) {

        throw new Error(
          "Failed to load employees."
        );
      }

      const data =
        await response.json();

      setEmployees(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Load Employees Error:",
        err
      );

      setError(
        "Failed to load employee data. Please check backend API."
      );
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

        fetch(
          "http://localhost:5000/api/units"
        ),

        fetch(
          "http://localhost:5000/api/departments"
        ),

        fetch(
          "http://localhost:5000/api/contractors"
        ),

        fetch(
          "http://localhost:5000/api/shifts"
        ),

        fetch(
          "http://localhost:5000/api/designations"
        ),

        fetch(
          "http://localhost:5000/api/categories"
        ),

        fetch(
          "http://localhost:5000/api/reporting-persons"
        ),
      ]);


      if (unitResponse.ok) {

        const data =
          await unitResponse.json();

        setUnits(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (departmentResponse.ok) {

        const data =
          await departmentResponse.json();

        setDepartments(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (contractorResponse.ok) {

        const data =
          await contractorResponse.json();

        setContractors(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (shiftResponse.ok) {

        const data =
          await shiftResponse.json();

        setShifts(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (designationResponse.ok) {

        const data =
          await designationResponse.json();

        setDesignations(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (categoryResponse.ok) {

        const data =
          await categoryResponse.json();

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );
      }


      if (reportingResponse.ok) {

        const data =
          await reportingResponse.json();

        setReportingPersons(
          Array.isArray(data)
            ? data
            : []
        );
      }

    } catch (err) {

      console.error(
        "Master Data Loading Error:",
        err
      );
    }
  };


  // =====================================================
  // PAGE LOAD
  // =====================================================

  useEffect(() => {

    loadEmployees();

    loadMasterData();

  }, []);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    let finalValue =
      value;


    if (
      name === "employeeCode"
    ) {

      finalValue =
        allowAlphaNumeric(
          value
        );
    }


    if (
      name === "employeeName"
    ) {

      finalValue =
        allowName(value);
    }


    if (
      name === "fatherName"
    ) {

      finalValue =
        allowName(value);
    }


    if (
      name === "aadhar"
    ) {

      finalValue =
        allowAadharNumber(
          value
        );
    }


    if (
      name === "contactNo"
    ) {

      finalValue =
        allowMobileNumber(
          value
        );
    }


    if (
      name === "mailId"
    ) {

      finalValue =
        allowEmailCharacters(
          value
        );
    }


    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          finalValue,
      })
    );

    setMessage("");

    setError("");
  };


  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {

    setFormData({
      ...emptyForm,
      creationDate:
        getTodayDate(),
    });

    setEditingId(null);

    setMessage("");

    setError("");

    setMediaEmployeeCode("");

    setPhotoUrl("");

    setPhotoPreview("");

    setPhotoFile(null);

    setDocuments([]);

    setDocumentFile(null);

    setDocumentName("");

    setDocumentsOpen(false);
  };


  // =====================================================
  // ADD EMPLOYEE
  // =====================================================

  const handleAdd = () => {

    setFormData({
      ...emptyForm,
      creationDate:
        getTodayDate(),
    });

    setEditingId(null);

    setMessage("");

    setError("");

    setSearchText("");

    setMediaEmployeeCode("");

    setPhotoUrl("");

    setPhotoPreview("");

    setPhotoFile(null);

    setDocuments([]);

    setDocumentFile(null);

    setDocumentName("");

    setDocumentsOpen(false);
  };


  // =====================================================
  // VALIDATE
  // =====================================================

  const validateForm = () => {

    if (
      !formData.employeeCode.trim()
    ) {

      setError(
        "Employee ID is required."
      );

      return false;
    }


    if (
      !formData.employeeName.trim()
    ) {

      setError(
        "Employee Name is required."
      );

      return false;
    }


    if (
      !formData.departmentCode.trim()
    ) {

      setError(
        "Department is required."
      );

      return false;
    }


    if (
      formData.aadhar &&
      formData.aadhar.length !== 12
    ) {

      setError(
        "Aadhaar number must contain exactly 12 digits."
      );

      return false;
    }


    if (
      formData.contactNo &&
      formData.contactNo.length !== 10
    ) {

      setError(
        "Contact number must contain exactly 10 digits."
      );

      return false;
    }


    if (
      formData.mailId &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.mailId
      )
    ) {

      setError(
        "Please enter a valid email address."
      );

      return false;
    }


    if (
      formData.joiningDate &&
      formData.resignDate &&
      formData.resignDate <
        formData.joiningDate
    ) {

      setError(
        "Resign Date cannot be before Joining Date."
      );

      return false;
    }


    return true;
  };


  // =====================================================
  // LOAD PHOTO + DOCUMENTS
  // =====================================================

  const loadEmployeeMedia =
    async (
      employeeCode
    ) => {

      const code =
        String(
          employeeCode || ""
        ).trim();


      if (!code) {

        setMediaEmployeeCode("");

        setPhotoUrl("");

        setDocuments([]);

        return;
      }


      try {

        setMediaLoading(true);

        setPhotoPreview("");

        const response =
          await fetch(
            `${MEDIA_API_URL}/${encodeURIComponent(
              code
            )}`
          );


        if (
          response.status === 404
        ) {

          setMediaEmployeeCode(code);

          setPhotoUrl("");

          setDocuments([]);

          return;
        }


        if (!response.ok) {

          throw new Error(
            "Failed to load employee photo/documents."
          );
        }


        const data =
          await response.json();


        setMediaEmployeeCode(code);

        setPhotoUrl(
          data.photoUrl || ""
        );

        setDocuments(
          Array.isArray(
            data.documents
          )
            ? data.documents
            : []
        );

      } catch (err) {

        console.error(
          "Employee Media Load Error:",
          err
        );

        setMediaEmployeeCode(code);

        setPhotoUrl("");

        setDocuments([]);

      } finally {

        setMediaLoading(false);
      }
    };


  // =====================================================
  // UPLOAD PHOTO
  // =====================================================

  const uploadEmployeePhoto =
    async (
      employeeCode,
      file
    ) => {

      if (
        !employeeCode ||
        !file
      ) {
        return;
      }


      const body =
        new FormData();

      body.append(
        "photo",
        file
      );


      const response =
        await fetch(
          `${MEDIA_API_URL}/${encodeURIComponent(
            employeeCode
          )}/photo`,
          {
            method: "POST",
            body,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to upload employee photo."
        );
      }


      setPhotoUrl(
        data.photoUrl || ""
      );

      setPhotoPreview("");

      setPhotoFile(null);
    };


  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const uploadEmployeeDocument =
    async (
      employeeCode,
      file,
      name
    ) => {

      if (
        !employeeCode ||
        !file
      ) {
        return;
      }


      const body =
        new FormData();

      body.append(
        "document",
        file
      );

      body.append(
        "documentName",
        String(
          name ||
          file.name
        ).trim()
      );


      const response =
        await fetch(
          `${MEDIA_API_URL}/${encodeURIComponent(
            employeeCode
          )}/document`,
          {
            method: "POST",
            body,
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to upload employee document."
        );
      }


      setDocuments(
        (previous) => [
          ...previous,
          data.document,
        ]
      );


      setDocumentFile(null);

      setDocumentName("");
    };


  // =====================================================
  // DOCUMENT ACTION
  // =====================================================

  const handleDocumentAction =
    (
      value,
      doc
    ) => {

      if (
        !value ||
        !doc?.url
      ) {
        return;
      }


      const url =
        `${BACKEND_URL}${doc.url}`;


      if (
        value === "view"
      ) {

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }


      if (
        value === "download"
      ) {

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          doc.originalName ||
          doc.name ||
          "document";

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );
      }
    };


  // =====================================================
  // SAVE / UPDATE EMPLOYEE
  // =====================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setMessage("");

      setError("");


      if (
        !validateForm()
      ) {
        return;
      }


      try {

        setLoading(true);


        const url =
          editingId
            ? `${API_URL}/${editingId}`
            : API_URL;


        const method =
          editingId
            ? "PUT"
            : "POST";


        const response =
          await fetch(
            url,
            {
              method,
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  formData
                ),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to save employee."
          );
        }


        const savedEmployee =
          data.employee ||
          data;


        const employeeCode =
          savedEmployee.employeeCode ||
          formData.employeeCode;


        // ===============================================
        // SAVE PHOTO AFTER EMPLOYEE IS SAVED
        // ===============================================

        if (photoFile) {

          await uploadEmployeePhoto(
            employeeCode,
            photoFile
          );
        }


        // ===============================================
        // SAVE DOCUMENT IF SELECTED
        // ===============================================

        if (documentFile) {

          await uploadEmployeeDocument(
            employeeCode,
            documentFile,
            documentName
          );
        }


        // ===============================================
        // LOAD SAVED MEDIA
        // ===============================================

        await loadEmployeeMedia(
          employeeCode
        );


        setMessage(
          editingId
            ? "Employee updated successfully!"
            : "Employee saved successfully!"
        );


        setFormData({
          ...emptyForm,
          creationDate:
            getTodayDate(),
        });


        setEditingId(null);

        setPhotoFile(null);

        setDocumentFile(null);

        setDocumentName("");

        await loadEmployees();

      } catch (err) {

        console.error(
          "Save Employee Error:",
          err
        );

        setError(
          err.message ||
          "Failed to save employee."
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // NORMALIZE
  // =====================================================

  const normalizeValue =
    (value) => {

      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value)
        .trim()
        .toLowerCase();
    };


  // =====================================================
  // MASTER VALUE HELPERS
  // =====================================================

  const getUnitValue =
    (item) =>
      String(
        item.unitCode ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getDepartmentValue =
    (item) =>
      String(
        item.departmentCode ||
        item.departmentName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getContractorValue =
    (item) =>
      String(
        item.contractorCode ||
        item.contractorName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getShiftValue =
    (item) =>
      String(
        item.shiftCode ||
        item.shiftName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getDesignationValue =
    (item) =>
      String(
        item.designationCode ||
        item.designationName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getCategoryValue =
    (item) =>
      String(
        item.categoryCode ||
        item.categoryName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  const getReportingValue =
    (item) =>
      String(
        item.reportingPersonCode ||
        item.reportingPersonName ||
        item.code ||
        item.name ||
        ""
      ).trim();


  // =====================================================
  // FIND UNIT
  // =====================================================

  const findUnitValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.unitCode
        );


      const found =
        units.find(
          (item) =>
            normalizeValue(
              getUnitValue(item)
            ) === current
        );


      return found
        ? getUnitValue(found)
        : employee.unitCode || "";
    };


  // =====================================================
  // FIND DEPARTMENT
  // =====================================================

  const findDepartmentValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.departmentCode
        );


      const found =
        departments.find(
          (item) =>
            normalizeValue(
              getDepartmentValue(
                item
              )
            ) === current
        );


      return found
        ? getDepartmentValue(
            found
          )
        : employee.departmentCode ||
          "";
    };


  // =====================================================
  // FIND CONTRACTOR
  // =====================================================

  const findContractorValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.contractorCode
        );


      const found =
        contractors.find(
          (item) =>
            normalizeValue(
              getContractorValue(
                item
              )
            ) === current
        );


      return found
        ? getContractorValue(
            found
          )
        : employee.contractorCode ||
          "";
    };


  // =====================================================
  // FIND SHIFT
  // =====================================================

  const findShiftValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.assignedShift
        );


      const found =
        shifts.find(
          (item) =>
            normalizeValue(
              getShiftValue(item)
            ) === current
        );


      return found
        ? getShiftValue(found)
        : employee.assignedShift ||
          "";
    };


  // =====================================================
  // FIND DESIGNATION
  // =====================================================

  const findDesignationValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.designation
        );


      const found =
        designations.find(
          (item) =>
            normalizeValue(
              getDesignationValue(
                item
              )
            ) === current
        );


      return found
        ? getDesignationValue(
            found
          )
        : employee.designation ||
          "";
    };


  // =====================================================
  // FIND CATEGORY
  // =====================================================

  const findCategoryValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.category
        );


      const found =
        categories.find(
          (item) =>
            normalizeValue(
              getCategoryValue(
                item
              )
            ) === current
        );


      return found
        ? getCategoryValue(found)
        : employee.category ||
          "";
    };


  // =====================================================
  // FIND REPORTING PERSON
  // =====================================================

  const findReportingValue =
    (employee) => {

      const current =
        normalizeValue(
          employee.reportingPerson
        );


      const found =
        reportingPersons.find(
          (item) =>
            normalizeValue(
              getReportingValue(
                item
              )
            ) === current
        );


      return found
        ? getReportingValue(
            found
          )
        : employee.reportingPerson ||
          "";
    };


  // =====================================================
  // FILL EMPLOYEE FORM
  // =====================================================

  const fillEmployeeForm =
    async (
      employee
    ) => {

      const newFormData = {

        unitCode:
          findUnitValue(
            employee
          ),

        employeeCode:
          employee.employeeCode ||
          "",

        employeeName:
          employee.employeeName ||
          "",

        fatherName:
          employee.fatherName ||
          "",

        dob:
          getInputDate(
            employee.dob
          ),

        aadhar:
          employee.aadhar ||
          "",

        contactNo:
          employee.contactNo ||
          "",

        mailId:
          employee.mailId ||
          "",

        departmentCode:
          findDepartmentValue(
            employee
          ),

        contractorCode:
          findContractorValue(
            employee
          ),

        assignedShift:
          findShiftValue(
            employee
          ),

        designation:
          findDesignationValue(
            employee
          ),

        category:
          findCategoryValue(
            employee
          ),

        reportingPerson:
          findReportingValue(
            employee
          ),

        joiningDate:
          getInputDate(
            employee.joiningDate
          ),

        resignDate:
          getInputDate(
            employee.resignDate
          ),

        creationDate:
          getInputDate(
            employee.creationDate
          ) ||
          getTodayDate(),
      };


      setFormData(
        newFormData
      );


      setEditingId(
        employee._id || null
      );


      setMessage("");

      setError("");


      // Previous employee ka preview remove
      setPhotoPreview("");

      setPhotoFile(null);

      setDocumentFile(null);

      setDocumentName("");


      // Selected employee ki photo/documents
      await loadEmployeeMedia(
        employee.employeeCode
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };


  // =====================================================
  // EMPLOYEE ID CLICK
  // =====================================================

  const handleEmployeeIdClick =
    (employee) => {

      fillEmployeeForm(
        employee
      );
    };


  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit =
    (employee) => {

      fillEmployeeForm(
        employee
      );
    };


  // =====================================================
  // SEARCH
  // =====================================================

  const search =
    searchText
      .toLowerCase()
      .trim();


  const filteredEmployees =
    employees.filter(
      (employee) => {

        return (

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
      }
    );


  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate =
    (date) => {

      if (!date) {
        return "-";
      }

      const d =
        new Date(date);

      if (
        isNaN(
          d.getTime()
        )
      ) {
        return "-";
      }

      return d.toLocaleDateString(
        "en-IN"
      );
    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className="employee-page"
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="page-header"
      >

        <div>

          <h1>
            Employee Master
          </h1>

        </div>

      </div>


      {/* =================================================
          SEARCH + ADD
      ================================================= */}

      <div
        className="employee-toolbar"
      >

        <div
          className="employee-search-box"
        >

          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search employee..."
            value={
              searchText
            }
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


        <button
          type="button"
          className="add-employee-btn"
          onClick={
            handleAdd
          }
        >

          <Plus
            size={18}
          />

          Add Employee

        </button>

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <div
        className="employee-tabs"
      >

        <button
          type="button"
          className="employee-tab active"
        >
          Employee Information
        </button>


        <button
          type="button"
          className="employee-tab"
          onClick={
            onBankDetail
          }
        >
          Bank Detail
        </button>


        <button
          type="button"
          className="employee-tab"
          onClick={
            onQualification
          }
        >
          Qualification
        </button>

      </div>


      {/* =================================================
          MAIN FORM
      ================================================= */}

      <form
        className="form-card"
        onSubmit={
          handleSubmit
        }
      >

        {/* =================================================
            FORM TITLE
        ================================================= */}

        <div
          className="section-title"
        >

          <UserRound
            size={21}
          />

          <div>

            <h2>

              {editingId
                ? "Edit Employee"
                : "Employee Details"}

            </h2>

          </div>

        </div>


        {/* =================================================
            LEFT FORM + RIGHT PHOTO
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 250px",
            gap: "16px",
            alignItems:
              "start",
          }}
        >

          {/* =================================================
              LEFT SIDE - EXISTING FORM
          ================================================= */}

          <div>

            <div
              className="form-grid"
            >

              {/* UNIT */}

              <div
                className="form-group"
              >

                <label>

                  <Building2
                    size={17}
                  />

                  Unit

                </label>


                <select
                  name="unitCode"
                  value={
                    formData.unitCode
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select unit
                  </option>


                  {units.map(
                    (unit) => {

                      const value =
                        getUnitValue(
                          unit
                        );

                      return (

                        <option
                          key={
                            unit._id ||
                            value
                          }
                          value={value}
                        >

                          {unit.unitName
                            ? `${value} - ${unit.unitName}`
                            : value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* EMPLOYEE ID */}

              <div
                className="form-group"
              >

                <label>

                  <Hash
                    size={17}
                  />

                  Employee ID

                  <span
                    className="required-star"
                  >
                    *
                  </span>

                </label>


                <input
                  type="text"
                  name="employeeCode"
                  value={
                    formData.employeeCode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter employee ID"
                />

              </div>


              {/* EMPLOYEE NAME */}

              <div
                className="form-group"
              >

                <label>

                  <User
                    size={17}
                  />

                  Employee Name

                  <span
                    className="required-star"
                  >
                    *
                  </span>

                </label>


                <input
                  type="text"
                  name="employeeName"
                  value={
                    formData.employeeName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter employee name"
                />

              </div>


              {/* FATHER NAME */}

              <div
                className="form-group"
              >

                <label>

                  <User
                    size={17}
                  />

                  Father Name

                </label>


                <input
                  type="text"
                  name="fatherName"
                  value={
                    formData.fatherName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter father name"
                />

              </div>


              {/* DOB */}

              <div
                className="form-group"
              >

                <label>

                  <CalendarDays
                    size={17}
                  />

                  Date of Birth

                </label>


                <input
                  type="date"
                  name="dob"
                  value={
                    formData.dob
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* AADHAAR */}

              <div
                className="form-group"
              >

                <label>

                  <CreditCard
                    size={17}
                  />

                  Aadhaar Number

                </label>


                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  name="aadhar"
                  value={
                    formData.aadhar
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="12 digit Aadhaar"
                />

              </div>


              {/* CONTACT */}

              <div
                className="form-group"
              >

                <label>

                  <Phone
                    size={17}
                  />

                  Contact Number

                </label>


                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  name="contactNo"
                  value={
                    formData.contactNo
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10 digit mobile number"
                />

              </div>


              {/* EMAIL */}

              <div
                className="form-group"
              >

                <label>

                  <Mail
                    size={17}
                  />

                  Email

                </label>


                <input
                  type="text"
                  name="mailId"
                  value={
                    formData.mailId
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter email address"
                />

              </div>


              {/* DEPARTMENT */}

              <div
                className="form-group"
              >

                <label>

                  <Factory
                    size={17}
                  />

                  Department

                  <span
                    className="required-star"
                  >
                    *
                  </span>

                </label>


                <select
                  name="departmentCode"
                  value={
                    formData.departmentCode
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select department
                  </option>


                  {departments.map(
                    (item) => {

                      const value =
                        getDepartmentValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* CONTRACTOR */}

              <div
                className="form-group"
              >

                <label>

                  <Building2
                    size={17}
                  />

                  Contractor

                </label>


                <select
                  name="contractorCode"
                  value={
                    formData.contractorCode
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select contractor
                  </option>


                  {contractors.map(
                    (item) => {

                      const value =
                        getContractorValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* SHIFT */}

              <div
                className="form-group"
              >

                <label>

                  <Clock3
                    size={17}
                  />

                  Assigned Shift

                </label>


                <select
                  name="assignedShift"
                  value={
                    formData.assignedShift
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select shift
                  </option>


                  {shifts.map(
                    (item) => {

                      const value =
                        getShiftValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* DESIGNATION */}

              <div
                className="form-group"
              >

                <label>

                  <BriefcaseBusiness
                    size={17}
                  />

                  Designation

                </label>


                <select
                  name="designation"
                  value={
                    formData.designation
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select designation
                  </option>


                  {designations.map(
                    (item) => {

                      const value =
                        getDesignationValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* CATEGORY */}

              <div
                className="form-group"
              >

                <label>

                  <UsersRound
                    size={17}
                  />

                  Category

                </label>


                <select
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select category
                  </option>


                  {categories.map(
                    (item) => {

                      const value =
                        getCategoryValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* REPORTING PERSON */}

              <div
                className="form-group"
              >

                <label>

                  <UserRound
                    size={17}
                  />

                  Reporting Person

                </label>


                <select
                  name="reportingPerson"
                  value={
                    formData.reportingPerson
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select reporting person
                  </option>


                  {reportingPersons.map(
                    (item) => {

                      const value =
                        getReportingValue(
                          item
                        );

                      return (

                        <option
                          key={
                            item._id ||
                            value
                          }
                          value={value}
                        >

                          {value}

                        </option>

                      );
                    }
                  )}

                </select>

              </div>


              {/* JOINING DATE */}

              <div
                className="form-group"
              >

                <label>

                  <CalendarDays
                    size={17}
                  />

                  Joining Date

                </label>


                <input
                  type="date"
                  name="joiningDate"
                  value={
                    formData.joiningDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* RESIGN DATE */}

              <div
                className="form-group"
              >

                <label>

                  <CalendarDays
                    size={17}
                  />

                  Resign Date

                </label>


                <input
                  type="date"
                  name="resignDate"
                  value={
                    formData.resignDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* CREATION DATE */}

              <div
                className="form-group"
              >

                <label>

                  <CalendarDays
                    size={17}
                  />

                  Creation Date

                </label>


                <input
                  type="date"
                  name="creationDate"
                  value={
                    formData.creationDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE PHOTO + DOCUMENTS
          ================================================= */}

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >

            {/* =================================================
                PHOTO TITLE
            ================================================= */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#123b70",
              }}
            >

              <Camera
                size={17}
              />

              Employee Photo

            </div>


            {/* =================================================
                PHOTO BOX
            ================================================= */}

            <div
              style={{
                width: "140px",
                height: "110px",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  "7px",
                margin:
                  "0 auto",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                overflow:
                  "hidden",
                background:
                  "#f8fafc",
              }}
            >

              {photoPreview ||
              photoUrl ? (

                <img
                  src={
                    photoPreview
                      ? photoPreview
                      : `${BACKEND_URL}${photoUrl}`
                  }
                  alt="Employee"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit:
                      "cover",
                  }}
                />

              ) : (

                <div
                  style={{
                    textAlign:
                      "center",
                    color:
                      "#94a3b8",
                    fontSize:
                      "12px",
                  }}
                >

                  <UserRound
                    size={40}
                    strokeWidth={1.5}
                  />

                  <div>
                    No Photo
                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                HIDDEN PHOTO INPUT
            ================================================= */}

            <input
              id="employee-photo-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              style={{
                display: "none",
              }}
              onChange={(e) => {

                const file =
                  e.target.files?.[0] ||
                  null;

                setPhotoFile(
                  file
                );


                if (file) {

                  const preview =
                    URL.createObjectURL(
                      file
                    );

                  setPhotoPreview(
                    preview
                  );

                } else {

                  setPhotoPreview(
                    ""
                  );
                }

              }}
            />


            {/* =================================================
                CHOOSE PHOTO
            ================================================= */}

            <label
              htmlFor="employee-photo-input"
              style={{
                width: "100%",
                height: "30px",
                background:
                  "#1769e0",
                color: "#fff",
                borderRadius:
                  "5px",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "6px",
                fontSize:
                  "12px",
                fontWeight:
                  600,
                cursor:
                  "pointer",
                boxSizing:
                  "border-box",
              }}
            >

              <Camera
                size={15}
              />

              Choose Photo

            </label>


            {/* =================================================
                DOCUMENTS DROPDOWN
            ================================================= */}

            <div
              style={{
                width: "100%",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  "6px",
                overflow:
                  "hidden",
                background:
                  "#fff",
              }}
            >

              {/* DOCUMENT HEADER */}

              <button
                type="button"
                onClick={() =>
                  setDocumentsOpen(
                    (previous) =>
                      !previous
                  )
                }
                style={{
                  width: "100%",
                  minHeight:
                    "38px",
                  border: "none",
                  background:
                    "#fff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  padding:
                    "0 10px",
                  cursor:
                    "pointer",
                  color:
                    "#243b53",
                  fontSize:
                    "13px",
                  fontWeight:
                    600,
                }}
              >

                <span
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                  }}
                >

                  <FileText
                    size={17}
                  />

                  Documents

                </span>


                <ChevronDown
                  size={17}
                  style={{
                    transform:
                      documentsOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition:
                      "0.2s",
                  }}
                />

              </button>


              {/* =================================================
                  DOCUMENT CONTENT
                  YAHI DOCUMENTS RAHENGE
              ================================================= */}

              {documentsOpen && (

                <div
                  style={{
                    borderTop:
                      "1px solid #e2e8f0",
                    padding:
                      "10px",
                    background:
                      "#f8fafc",
                  }}
                >

                  {/* DOCUMENT NAME */}

                  <input
                    type="text"
                    value={
                      documentName
                    }
                    onChange={(e) =>
                      setDocumentName(
                        e.target.value
                      )
                    }
                    placeholder="Document name"
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      height: "32px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "5px",
                      padding:
                        "0 8px",
                      marginBottom:
                        "7px",
                      fontSize:
                        "12px",
                    }}
                  />


                  {/* DOCUMENT FILE */}

                  <input
                    type="file"
                    onChange={(e) =>
                      setDocumentFile(
                        e.target.files?.[0] ||
                        null
                      )
                    }
                    style={{
                      width:
                        "100%",
                      fontSize:
                        "11px",
                      marginBottom:
                        "8px",
                    }}
                  />


                  {/* UPLOAD BUTTON */}

                  {documentFile && (

                    <button
                      type="button"
                      onClick={async () => {

                        if (
                          !formData.employeeCode.trim()
                        ) {

                          setError(
                            "First select or save an Employee ID."
                          );

                          return;
                        }


                        try {

                          setError("");

                          await uploadEmployeeDocument(
                            formData.employeeCode.trim(),
                            documentFile,
                            documentName
                          );


                          setMessage(
                            "Document uploaded successfully!"
                          );

                        } catch (err) {

                          setError(
                            err.message ||
                            "Failed to upload document."
                          );
                        }

                      }}
                      style={{
                        width:
                          "100%",
                        height:
                          "30px",
                        border:
                          "none",
                        borderRadius:
                          "5px",
                        background:
                          "#1769e0",
                        color:
                          "#fff",
                        fontSize:
                          "12px",
                        fontWeight:
                          600,
                        cursor:
                          "pointer",
                        marginBottom:
                          "9px",
                      }}
                    >

                      Upload Document

                    </button>

                  )}


                  {/* DOCUMENT LIST */}

                  {mediaLoading ? (

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#64748b",
                        padding:
                          "6px 0",
                      }}
                    >
                      Loading documents...
                    </div>

                  ) : documents.length === 0 ? (

                    <div
                      style={{
                        fontSize:
                          "11px",
                        color:
                          "#94a3b8",
                        padding:
                          "6px 0",
                      }}
                    >
                      No documents uploaded.
                    </div>

                  ) : (

                    <div
                      style={{
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap:
                          "6px",
                      }}
                    >

                      {documents.map(
                        (doc) => (

                          <div
                            key={
                              doc._id ||
                              doc.fileName
                            }
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap:
                                "6px",
                              padding:
                                "7px",
                              border:
                                "1px solid #dbe3ec",
                              borderRadius:
                                "5px",
                              background:
                                "#fff",
                            }}
                          >

                            <div
                              style={{
                                minWidth:
                                  0,
                                flex:
                                  1,
                              }}
                            >

                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    600,
                                  color:
                                    "#334155",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >

                                {
                                  doc.name ||
                                  doc.originalName
                                }

                              </div>


                              <div
                                style={{
                                  fontSize:
                                    "9px",
                                  color:
                                    "#94a3b8",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >

                                {
                                  doc.originalName ||
                                  ""
                                }

                              </div>

                            </div>


                            {/* VIEW / DOWNLOAD */}

                            <select
                              defaultValue=""
                              onChange={(e) => {

                                handleDocumentAction(
                                  e.target.value,
                                  doc
                                );

                                e.target.value =
                                  "";

                              }}
                              style={{
                                height:
                                  "28px",
                                border:
                                  "1px solid #cbd5e1",
                                borderRadius:
                                  "4px",
                                background:
                                  "#fff",
                                fontSize:
                                  "10px",
                                cursor:
                                  "pointer",
                              }}
                            >

                              <option value="">
                                Action
                              </option>

                              <option value="view">
                                View
                              </option>

                              <option value="download">
                                Download
                              </option>

                            </select>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div
            className="success-message"
          >
            {message}
          </div>

        )}


        {error && (

          <div
            className="error-message"
          >

            <AlertCircle
              size={17}
            />

            {error}

          </div>

        )}


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div
          className="form-actions"
        >

          <button
            type="button"
            className="clear-btn"
            onClick={
              handleClear
            }
          >

            <RotateCcw
              size={17}
            />

            Clear

          </button>


          <button
            type="submit"
            className="next-btn"
            disabled={
              loading
            }
          >

            <Save
              size={17}
            />

            {loading
              ? "Saving..."
              : editingId
              ? "Update Employee"
              : "Save Employee"}

          </button>

        </div>

      </form>


      {/* =================================================
          SEARCH RESULTS
      ================================================= */}

      {searchText.trim() && (

        <div
          className="employee-search-results"
        >

          <div
            className="search-results-header"
          >

            <strong>
              Employee Search Results
            </strong>

            <span>

              {
                filteredEmployees.length
              }

              {" "}record(s)

            </span>

          </div>


          {filteredEmployees.length === 0 ? (

            <div
              className="no-search-result"
            >
              No employee found.
            </div>

          ) : (

            <div
              className="employee-results-table"
            >

              <table>

                <thead>

                  <tr>

                    <th>
                      Employee ID
                    </th>

                    <th>
                      Employee Name
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredEmployees.map(
                    (employee) => (

                      <tr
                        key={
                          employee._id
                        }
                      >

                        <td>

                          <button
                            type="button"
                            className="employee-id-link"
                            onClick={() =>
                              handleEmployeeIdClick(
                                employee
                              )
                            }
                          >

                            <strong>
                              {
                                employee.employeeCode
                              }
                            </strong>

                          </button>

                        </td>


                        <td>
                          {
                            employee.employeeName
                          }
                        </td>


                        <td>
                          {
                            employee.departmentCode
                          }
                        </td>


                        <td>
                          {
                            employee.contactNo ||
                            "-"
                          }
                        </td>


                        <td>

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(
                                employee
                              )
                            }
                            title="Edit"
                          >

                            <Edit
                              size={15}
                            />

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


      {/* =================================================
          EMPLOYEE RECORDS
      ================================================= */}

      <div
        className="employee-saved-data"
      >

        <div
          className="saved-data-header"
        >

          <div>

            <strong>
              Employee Records
            </strong>

          </div>

        </div>


        {employees.length === 0 ? (

          <div
            className="no-saved-data"
          >
            No employee data available.
          </div>

        ) : (

          <div
            className="employee-results-table"
          >

            <table>

              <thead>

                <tr>

                  <th>
                    Unit
                  </th>

                  <th>
                    Employee ID
                  </th>

                  <th>
                    Employee Name
                  </th>

                  <th>
                    Father Name
                  </th>

                  <th>
                    DOB
                  </th>

                  <th>
                    Aadhaar
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Contractor
                  </th>

                  <th>
                    Shift
                  </th>

                  <th>
                    Designation
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Reporting Person
                  </th>

                  <th>
                    Joining Date
                  </th>

                  <th>
                    Resign Date
                  </th>

                  <th>
                    Creation Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {employees.map(
                  (employee) => (

                    <tr
                      key={
                        employee._id
                      }
                    >

                      <td>
                        {
                          employee.unitCode ||
                          "-"
                        }
                      </td>


                      <td>

                        <button
                          type="button"
                          className="employee-id-link"
                          onClick={() =>
                            handleEmployeeIdClick(
                              employee
                            )
                          }
                        >

                          <strong>
                            {
                              employee.employeeCode
                            }
                          </strong>

                        </button>

                      </td>


                      <td>
                        {
                          employee.employeeName
                        }
                      </td>


                      <td>
                        {
                          employee.fatherName ||
                          "-"
                        }
                      </td>


                      <td>
                        {formatDate(
                          employee.dob
                        )}
                      </td>


                      <td>
                        {
                          employee.aadhar ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.contactNo ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.mailId ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.departmentCode ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.contractorCode ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.assignedShift ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.designation ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.category ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          employee.reportingPerson ||
                          "-"
                        }
                      </td>


                      <td>
                        {formatDate(
                          employee.joiningDate
                        )}
                      </td>


                      <td>
                        {formatDate(
                          employee.resignDate
                        )}
                      </td>


                      <td>
                        {formatDate(
                          employee.creationDate
                        )}
                      </td>


                      <td>

                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(
                              employee
                            )
                          }
                          title="Edit"
                        >

                          <Edit
                            size={15}
                          />

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


export default EmployeeMaster;