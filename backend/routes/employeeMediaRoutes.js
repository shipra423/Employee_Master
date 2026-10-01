const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Employee = require("../models/Employee");

const router = express.Router();

// =====================================================
// UPLOAD DIRECTORIES
// =====================================================

const uploadRoot = path.join(
  __dirname,
  "..",
  "uploads"
);

const employeeUploadDir = path.join(
  uploadRoot,
  "employees"
);

const documentUploadDir = path.join(
  uploadRoot,
  "documents"
);

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, {
    recursive: true,
  });
}

if (!fs.existsSync(employeeUploadDir)) {
  fs.mkdirSync(employeeUploadDir, {
    recursive: true,
  });
}

if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, {
    recursive: true,
  });
}

// =====================================================
// PHOTO STORAGE
// =====================================================

const photoStorage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(
      null,
      employeeUploadDir
    );

  },

  filename: (req, file, cb) => {

    const employeeCode =
      String(
        req.params.employeeCode || "employee"
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    cb(
      null,
      `${employeeCode}-photo${extension}`
    );

  },

});

// =====================================================
// PHOTO UPLOAD
// =====================================================

const photoUpload = multer({

  storage: photoStorage,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {

      return cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
      );

    }

    cb(
      null,
      true
    );

  },

});

// =====================================================
// DOCUMENT STORAGE
// =====================================================

const documentStorage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      const employeeCode =
        String(
          req.params.employeeCode ||
            "employee"
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
          );

      const employeeDocumentDir =
        path.join(
          documentUploadDir,
          employeeCode
        );

      if (
        !fs.existsSync(
          employeeDocumentDir
        )
      ) {

        fs.mkdirSync(
          employeeDocumentDir,
          {
            recursive: true,
          }
        );

      }

      cb(
        null,
        employeeDocumentDir
      );

    },

    filename: (
      req,
      file,
      cb
    ) => {

      const originalName =
        path
          .basename(
            file.originalname
          )
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

      cb(
        null,
        `${Date.now()}-${originalName}`
      );

    },

  });

// =====================================================
// DOCUMENT UPLOAD
// =====================================================

const documentUpload =
  multer({

    storage:
      documentStorage,

    limits: {
      fileSize:
        20 * 1024 * 1024,
    },

  });

// =====================================================
// GET EMPLOYEE MEDIA
//
// Frontend:
// GET /api/employee-media/:employeeCode
// =====================================================

router.get(
  "/:employeeCode",
  async (
    req,
    res
  ) => {

    try {

      const employeeCode =
        String(
          req.params.employeeCode ||
            ""
        ).trim();

      if (!employeeCode) {

        return res.status(400).json({
          message:
            "Employee Code is required",
        });

      }

      const employee =
        await Employee.findOne({
          employeeCode:
            employeeCode,
        });

      if (!employee) {

        return res.status(404).json({
          message:
            "Employee not found",
        });

      }

      // =================================================
      // PHOTO
      // =================================================

      let photoUrl =
        employee.photo || "";

      // =================================================
      // DOCUMENTS
      // =================================================

      const safeEmployeeCode =
        employeeCode.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      const employeeDocumentDir =
        path.join(
          documentUploadDir,
          safeEmployeeCode
        );

      let documents = [];

      if (
        fs.existsSync(
          employeeDocumentDir
        )
      ) {

        const files =
          fs.readdirSync(
            employeeDocumentDir
          );

        documents =
          files.map(
            (fileName) => {

              return {

                fileName:
                  fileName,

                name:
                  fileName,

                originalName:
                  fileName,

                url:
                  `/uploads/documents/${encodeURIComponent(
                    safeEmployeeCode
                  )}/${encodeURIComponent(
                    fileName
                  )}`,

              };

            }
          );

      }

      res.status(200).json({

        employeeCode:
          employeeCode,

        photoUrl:
          photoUrl,

        documents:
          documents,

      });

    } catch (error) {

      console.error(
        "GET Employee Media Error:",
        error
      );

      res.status(500).json({

        message:
          "Failed to load employee media",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// UPLOAD / UPDATE EMPLOYEE PHOTO
//
// Frontend:
// POST /api/employee-media/:employeeCode/photo
//
// IMPORTANT:
// Employee Code URL se aa raha hai.
// =====================================================

router.post(
  "/:employeeCode/photo",
  photoUpload.single("photo"),
  async (
    req,
    res
  ) => {

    try {

      const employeeCode =
        String(
          req.params.employeeCode ||
            ""
        ).trim();

      if (!employeeCode) {

        return res.status(400).json({
          message:
            "Employee ID is required",
        });

      }

      if (!req.file) {

        return res.status(400).json({
          message:
            "Please select a photo",
        });

      }

      // =================================================
      // FIND EMPLOYEE
      // =================================================

      const employee =
        await Employee.findOne({
          employeeCode:
            employeeCode,
        });

      if (!employee) {

        if (
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

        }

        return res.status(404).json({
          message:
            "Employee not found",
        });

      }

      // =================================================
      // DELETE OLD PHOTO
      // =================================================

      if (employee.photo) {

        const oldPhotoPath =
          path.join(
            uploadRoot,
            employee.photo
              .replace(
                /^\/uploads\//,
                ""
              )
          );

        if (
          fs.existsSync(
            oldPhotoPath
          ) &&
          oldPhotoPath !==
            req.file.path
        ) {

          try {

            fs.unlinkSync(
              oldPhotoPath
            );

          } catch (
            deleteError
          ) {

            console.log(
              "Old photo delete error:",
              deleteError.message
            );

          }

        }

      }

      // =================================================
      // SAVE PHOTO PATH IN MONGODB
      // =================================================

      const photoUrl =
        `/uploads/employees/${encodeURIComponent(
          req.file.filename
        )}`;

      employee.photo =
        photoUrl;

      await employee.save();

      // =================================================
      // RESPONSE
      // =================================================

      res.status(200).json({

        message:
          "Employee photo saved successfully",

        photoUrl:
          photoUrl,

        employeeCode:
          employeeCode,

      });

    } catch (error) {

      console.error(
        "Employee Photo Upload Error:",
        error
      );

      if (
        req.file &&
        fs.existsSync(
          req.file.path
        )
      ) {

        try {

          fs.unlinkSync(
            req.file.path
          );

        } catch {}

      }

      res.status(500).json({

        message:
          "Failed to save employee photo",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// UPLOAD EMPLOYEE DOCUMENT
//
// Frontend:
// POST /api/employee-media/:employeeCode/document
// =====================================================

router.post(
  "/:employeeCode/document",
  documentUpload.single(
    "document"
  ),
  async (
    req,
    res
  ) => {

    try {

      const employeeCode =
        String(
          req.params.employeeCode ||
            ""
        ).trim();

      if (!employeeCode) {

        return res.status(400).json({
          message:
            "Employee ID is required",
        });

      }

      if (!req.file) {

        return res.status(400).json({
          message:
            "Please select a document",
        });

      }

      // =================================================
      // FIND EMPLOYEE
      // =================================================

      const employee =
        await Employee.findOne({
          employeeCode:
            employeeCode,
        });

      if (!employee) {

        if (
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

        }

        return res.status(404).json({
          message:
            "Employee not found",
        });

      }

      // =================================================
      // DOCUMENT OBJECT
      // =================================================

      const safeEmployeeCode =
        employeeCode.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      const documentData = {

        fileName:
          req.file.filename,

        name:
          String(
            req.body.documentName ||
              req.file.originalname
          ).trim(),

        originalName:
          req.file.originalname,

        url:
          `/uploads/documents/${encodeURIComponent(
            safeEmployeeCode
          )}/${encodeURIComponent(
            req.file.filename
          )}`,

      };

      // =================================================
      // RESPONSE
      // =================================================

      res.status(201).json({

        message:
          "Document uploaded successfully",

        employeeCode:
          employeeCode,

        document:
          documentData,

      });

    } catch (error) {

      console.error(
        "Employee Document Upload Error:",
        error
      );

      if (
        req.file &&
        fs.existsSync(
          req.file.path
        )
      ) {

        try {

          fs.unlinkSync(
            req.file.path
          );

        } catch {}

      }

      res.status(500).json({

        message:
          "Failed to upload document",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// DELETE EMPLOYEE DOCUMENT
//
// DELETE:
// /api/employee-media/:employeeCode/document/:fileName
// =====================================================

router.delete(
  "/:employeeCode/document/:fileName",
  async (
    req,
    res
  ) => {

    try {

      const employeeCode =
        String(
          req.params.employeeCode ||
            ""
        ).trim();

      const fileName =
        path.basename(
          req.params.fileName
        );

      const safeEmployeeCode =
        employeeCode.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

      const filePath =
        path.join(
          documentUploadDir,
          safeEmployeeCode,
          fileName
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {

        return res.status(404).json({
          message:
            "Document not found",
        });

      }

      fs.unlinkSync(
        filePath
      );

      res.status(200).json({

        message:
          "Document deleted successfully",

      });

    } catch (error) {

      console.error(
        "Delete Employee Document Error:",
        error
      );

      res.status(500).json({

        message:
          "Failed to delete document",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// MULTER / GENERAL ERROR
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {

    if (
      error instanceof
      multer.MulterError
    ) {

      return res.status(400).json({

        message:
          error.message,

      });

    }

    if (error) {

      return res.status(400).json({

        message:
          error.message,

      });

    }

    next();

  }
);

module.exports =
  router;