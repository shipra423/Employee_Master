
// ============================================
// COMMON INPUT VALIDATION
// Employee Master Project
// ============================================

// Sirf numbers allow karega
export const allowNumbersOnly = (value) => {
  return value.replace(/[^0-9]/g, "");
};

// Sirf alphabets + space allow karega
export const allowAlphabetsOnly = (value) => {
  return value.replace(/[^a-zA-Z\s]/g, "");
};

// Alphabets + space + dot allow karega
// Example: "A.K. Sharma"
export const allowName = (value) => {
  return value.replace(/[^a-zA-Z\s.]/g, "");
};

// Email ke liye allowed characters
export const allowEmailCharacters = (value) => {
  return value.replace(/[^a-zA-Z0-9@._+-]/g, "");
};

// Mobile number: sirf 10 digits
export const allowMobileNumber = (value) => {
  return value.replace(/[^0-9]/g, "").slice(0, 10);
};

// Aadhaar: sirf 12 digits
export const allowAadharNumber = (value) => {
  return value.replace(/[^0-9]/g, "").slice(0, 12);
};

// PIN / Code jahan sirf numeric code chahiye
export const allowInteger = (value) => {
  return value.replace(/[^0-9]/g, "");
};

// Decimal / Salary ke liye
// Example: 15000.50
export const allowDecimal = (value) => {
  return value
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");
};

// General alphanumeric code
// Example: EMP001, UNIT01
export const allowAlphaNumeric = (value) => {
  return value.replace(/[^a-zA-Z0-9]/g, "");
};

