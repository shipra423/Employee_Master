
import { useState } from "react";

import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

function ExcelUpload() {
  // ==========================================
  // STATES
  // ==========================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [uploadResult, setUploadResult] =
    useState(null);

  // ==========================================
  // API URL
  // ==========================================

  const API_URL =
    "http://localhost:5000/api/excel-upload";

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setMessage("");
    setError("");
    setUploadResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileName =
      file.name.toLowerCase();

    const allowedExtensions = [
      ".xlsx",
      ".xls",
      ".csv",
    ];

    const isValidFile =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!isValidFile) {
      setSelectedFile(null);

      setError(
        "Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed."
      );

      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // ==========================================
  // UPLOAD
  // ==========================================

  const handleUpload = async () => {
    setMessage("");
    setError("");
    setUploadResult(null);

    if (!selectedFile) {
      setError(
        "Please select an Excel or CSV file first."
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response =
        await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload file."
        );
      }

      setMessage(
        "Employee data uploaded successfully!"
      );

      setUploadResult(data);

      setSelectedFile(null);

      // Reset file input
      const fileInput =
        document.getElementById(
          "employee-file-input"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Excel upload error:",
        err
      );

      setError(
        err.message ||
          "Failed to upload file."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLEAR
  // ==========================================

  const handleClear = () => {
    setSelectedFile(null);
    setMessage("");
    setError("");
    setUploadResult(null);

    const fileInput =
      document.getElementById(
        "employee-file-input"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="employee-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="page-header">

        <div>
          <h1>
            Excel Upload
          </h1>

          <p>
            Upload employee data through
            Excel or CSV
          </p>
        </div>

        <div className="form-badge">
          Employee Master
        </div>

      </div>

      {/* ======================================
          UPLOAD CARD
      ====================================== */}

      <div className="form-card">

        <div className="section-title">

          <FileSpreadsheet
            size={21}
          />

          <div>

            <h2>
              Upload Employee Data
            </h2>

            <p>
              Upload .xlsx, .xls or .csv
              employee file
            </p>

          </div>

        </div>

        {/* ====================================
            UPLOAD BOX
        ==================================== */}

        <div className="excel-upload-box">

          <FileSpreadsheet
            size={45}
          />

          <h3>
            Upload Employee File
          </h3>

          <p>
            Supported formats:
            .xlsx, .xls, .csv
          </p>

          <input
            id="employee-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={
              handleFileChange
            }
          />

        </div>

        {/* ====================================
            SELECTED FILE
        ==================================== */}

        {selectedFile && (

          <div className="success-message">

            <FileSpreadsheet
              size={18}
            />

            Selected File:

            <strong>
              {selectedFile.name}
            </strong>

          </div>

        )}

        {/* ====================================
            SUCCESS
        ==================================== */}

        {message && (

          <div className="success-message">

            <CheckCircle
              size={18}
            />

            {message}

          </div>

        )}

        {/* ====================================
            ERROR
        ==================================== */}

        {error && (

          <div className="error-message">

            <AlertCircle
              size={18}
            />

            {error}

          </div>

        )}

        {/* ====================================
            UPLOAD RESULT
        ==================================== */}

        {uploadResult && (

          <div className="form-card">

            <div className="section-title">

              <CheckCircle
                size={20}
              />

              <div>

                <h2>
                  Upload Summary
                </h2>

              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Total Records
                </label>

                <input
                  type="text"
                  value={
                    uploadResult.totalRecords ??
                    0
                  }
                  readOnly
                />

              </div>

              <div className="form-group">

                <label>
                  Saved Records
                </label>

                <input
                  type="text"
                  value={
                    uploadResult.savedRecords ??
                    0
                  }
                  readOnly
                />

              </div>

              <div className="form-group">

                <label>
                  Skipped Records
                </label>

                <input
                  type="text"
                  value={
                    uploadResult.skippedRecords ??
                    0
                  }
                  readOnly
                />

              </div>

            </div>

          </div>

        )}

        {/* ====================================
            BUTTONS
        ==================================== */}

        <div className="form-actions">

          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
          >

            <RotateCcw
              size={17}
            />

            Clear

          </button>

          <button
            type="button"
            className="next-btn"
            onClick={handleUpload}
            disabled={
              loading ||
              !selectedFile
            }
          >

            <Upload
              size={17}
            />

            {loading
              ? "Uploading..."
              : "Upload File"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default ExcelUpload;

