import { useState } from "react";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import "../styles/Login.css";

import saiLogo from "../assets/sai-logo.png";
import aerostarLogo from "../assets/aerostar.png";

// =====================================================
// ADMIN
// =====================================================

const DEFAULT_USERNAME = "shipra";
const DEFAULT_PASSWORD = "12345";

// =====================================================
// API
// =====================================================

const API_URL =
  "http://localhost:5000/api/users";

// =====================================================
// LOGIN
// =====================================================

function Login({ onLogin }) {

  // ===================================================
  // LOGIN STATES
  // ===================================================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  // ===================================================
  // CHANGE PASSWORD
  // ===================================================

  const [
    showChangePassword,
    setShowChangePassword,
  ] = useState(false);

  const [
    oldPassword,
    setOldPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showOldPassword,
    setShowOldPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    changePasswordError,
    setChangePasswordError,
  ] = useState("");

  const [
    changePasswordSuccess,
    setChangePasswordSuccess,
  ] = useState("");

  // ===================================================
  // STORAGE
  // ===================================================

  const saveLogin = (
    userData
  ) => {
    try {
      localStorage.setItem(
        "employeeMasterLoggedIn",
        "true"
      );

      localStorage.setItem(
        "employeeMasterCurrentUser",
        String(
          userData.userId || ""
        )
      );

      localStorage.setItem(
        "employeeMasterCurrentUserData",
        JSON.stringify(
          userData
        )
      );
    } catch (error) {
      console.error(
        "LOGIN STORAGE ERROR:",
        error
      );
    }
  };

  // ===================================================
  // PASSWORD VALIDATION
  // ===================================================

  const validatePassword = (
    value
  ) => {
    return (
      value.length >= 5 &&
      /[A-Za-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[!@#$%^&*~]/.test(value)
    );
  };

  // ===================================================
  // ADMIN LOGIN
  // ===================================================

  const handleAdminLogin = () => {

    const savedAdminPassword =
      localStorage.getItem(
        "employeeMasterPassword"
      );

    const adminPassword =
      savedAdminPassword ||
      DEFAULT_PASSWORD;

    if (
      password !==
      adminPassword
    ) {
      setLoginError(
        "Invalid User ID or password."
      );

      return false;
    }

    const adminUser = {
      userId:
        DEFAULT_USERNAME,

      userName:
        "System Administrator",

      role:
        "ADMIN",

      passwordLevel:
        "ADMIN",

      valid:
        "YES",

      isSystemAdmin:
        true,
    };

    saveLogin(
      adminUser
    );

    if (
      typeof onLogin ===
      "function"
    ) {
      onLogin(
        adminUser
      );
    }

    return true;
  };

  // ===================================================
  // LOGIN
  // ===================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoginError("");

    const enteredUsername =
      username.trim();

    const enteredPassword =
      password;

    // =================================================
    // REQUIRED
    // =================================================

    if (!enteredUsername) {
      setLoginError(
        "Please enter User ID."
      );

      return;
    }

    if (!enteredPassword) {
      setLoginError(
        "Please enter password."
      );

      return;
    }

    // =================================================
    // ADMIN
    // =================================================

    if (
      enteredUsername
        .toLowerCase() ===
      DEFAULT_USERNAME
        .toLowerCase()
    ) {

      handleAdminLogin();

      return;
    }

    // =================================================
    // MONGODB USER LOGIN
    // =================================================

    try {

      console.log(
        "LOGIN API CALL:",
        enteredUsername
      );

      const response =
        await fetch(
          `${API_URL}/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                userId:
                  enteredUsername,

                password:
                  enteredPassword,
              }),
          }
        );

      const data =
        await response.json();

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      const userData =
        data.user;

      saveLogin(
        userData
      );

      setUsername("");
      setPassword("");

      if (
        typeof onLogin ===
        "function"
      ) {
        onLogin(
          userData
        );
      }

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      setLoginError(
        error.message ||
          "Invalid User ID or password."
      );
    }
  };

  // ===================================================
  // OPEN CHANGE PASSWORD
  // ===================================================

  const handleOpenChangePassword = () => {

    const currentUser =
      localStorage.getItem(
        "employeeMasterCurrentUser"
      );

    if (!currentUser) {

      setLoginError(
        "Please login first before changing password."
      );

      return;
    }

    setShowChangePassword(
      true
    );

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setChangePasswordError("");
    setChangePasswordSuccess("");
    setLoginError("");
  };

  // ===================================================
  // BACK
  // ===================================================

  const handleBackToLogin = () => {

    setShowChangePassword(
      false
    );

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setChangePasswordError("");
    setChangePasswordSuccess("");
  };

  // ===================================================
  // CHANGE PASSWORD
  // ===================================================

  const handleChangePassword = async (
    e
  ) => {

    e.preventDefault();

    setChangePasswordError("");
    setChangePasswordSuccess("");

    const currentUser =
      localStorage.getItem(
        "employeeMasterCurrentUser"
      );

    if (!currentUser) {

      setChangePasswordError(
        "Please login first."
      );

      return;
    }

    // =================================================
    // ADMIN PASSWORD
    // =================================================

    if (
      currentUser.toLowerCase() ===
      DEFAULT_USERNAME.toLowerCase()
    ) {

      const currentPassword =
        localStorage.getItem(
          "employeeMasterPassword"
        ) ||
        DEFAULT_PASSWORD;

      if (!oldPassword) {

        setChangePasswordError(
          "Please enter old password."
        );

        return;
      }

      if (
        oldPassword !==
        currentPassword
      ) {

        setChangePasswordError(
          "Old password is incorrect."
        );

        return;
      }

      if (!newPassword) {

        setChangePasswordError(
          "Please enter new password."
        );

        return;
      }

      if (
        !validatePassword(
          newPassword
        )
      ) {

        setChangePasswordError(
          "Password must contain at least 5 characters, a letter, a number and a special character."
        );

        return;
      }

      if (
        !confirmPassword
      ) {

        setChangePasswordError(
          "Please confirm new password."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {

        setChangePasswordError(
          "New password and confirm password do not match."
        );

        return;
      }

      if (
        oldPassword ===
        newPassword
      ) {

        setChangePasswordError(
          "New password must be different from old password."
        );

        return;
      }

      localStorage.setItem(
        "employeeMasterPassword",
        newPassword
      );

      setChangePasswordSuccess(
        "Password changed successfully!"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {

        setShowChangePassword(
          false
        );

        setChangePasswordSuccess(
          ""
        );

      }, 1500);

      return;
    }

    // =================================================
    // NORMAL USER
    //
    // IMPORTANT:
    // Password change now goes to MongoDB.
    // =================================================

    try {

      if (!oldPassword) {

        setChangePasswordError(
          "Please enter old password."
        );

        return;
      }

      if (!newPassword) {

        setChangePasswordError(
          "Please enter new password."
        );

        return;
      }

      if (
        !validatePassword(
          newPassword
        )
      ) {

        setChangePasswordError(
          "Password must contain at least 5 characters, a letter, a number and a special character."
        );

        return;
      }

      if (!confirmPassword) {

        setChangePasswordError(
          "Please confirm new password."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {

        setChangePasswordError(
          "New password and confirm password do not match."
        );

        return;
      }

      if (
        oldPassword ===
        newPassword
      ) {

        setChangePasswordError(
          "New password must be different from old password."
        );

        return;
      }

      // =================================================
      // FIRST GET CURRENT USER
      // =================================================

      const userResponse =
        await fetch(
          `${API_URL}`
        );

      const users =
        await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          "Unable to fetch user."
        );
      }

      const currentUserData =
        users.find(
          (user) =>
            String(
              user.userId || ""
            )
              .trim()
              .toLowerCase() ===
            currentUser
              .trim()
              .toLowerCase()
        );

      if (!currentUserData) {
        throw new Error(
          "Current user was not found."
        );
      }

      // =================================================
      // UPDATE PASSWORD
      // =================================================

      const updateResponse =
        await fetch(
          `${API_URL}/${currentUserData._id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                unit:
                  currentUserData.unit,

                empId:
                  currentUserData.empId,

                userName:
                  currentUserData.userName,

                validFrom:
                  currentUserData.validFrom,

                validTo:
                  currentUserData.validTo,

                valid:
                  currentUserData.valid,

                pwdChangeDays:
                  currentUserData.pwdChangeDays,

                passwordLevel:
                  currentUserData.passwordLevel,

                roles:
                  currentUserData.roles ||
                  [],

                authorizedUnits:
                  currentUserData.authorizedUnits ||
                  [],

                password:
                  newPassword,
              }),
          }
        );

      const updateData =
        await updateResponse.json();

      if (
        !updateResponse.ok
      ) {
        throw new Error(
          updateData.message ||
            "Password update failed."
        );
      }

      setChangePasswordSuccess(
        "Password changed successfully!"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {

        setShowChangePassword(
          false
        );

        setChangePasswordSuccess(
          ""
        );

      }, 1500);

    } catch (error) {

      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      setChangePasswordError(
        error.message ||
          "Failed to change password."
      );
    }
  };

  // ===================================================
  // CHANGE PASSWORD SCREEN
  // ===================================================

  if (
    showChangePassword
  ) {

    return (
      <div className="login-page">

        <div className="login-card">

          <div className="login-logos">

            <div className="login-logo-box">

              <img
                src={saiLogo}
                alt="SAI Group Logo"
                className="sai-login-logo"
              />

            </div>

            <div className="login-logo-box aerostar-box">

              <img
                src={aerostarLogo}
                alt="Aerostar Logo"
                className="aerostar-login-logo"
              />

            </div>

          </div>

          <div className="login-heading">

            <KeyRound size={28} />

            <h1>
              Change Password
            </h1>

            <p>
              Update your login password
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={
              handleChangePassword
            }
          >

            <div className="login-field">

              <label>
                <User size={16} />
                Username
              </label>

              <div className="input-wrapper">

                <User size={18} />

                <input
                  type="text"
                  value={
                    localStorage.getItem(
                      "employeeMasterCurrentUser"
                    ) || ""
                  }
                  readOnly
                />

              </div>

            </div>

            {/* OLD PASSWORD */}

            <div className="login-field">

              <label>
                <Lock size={16} />
                Old Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showOldPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    oldPassword
                  }
                  placeholder="Enter old password"
                  onChange={(e) =>
                    setOldPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowOldPassword(
                      !showOldPassword
                    )
                  }
                >
                  {showOldPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div className="login-field">

              <label>
                <KeyRound size={16} />
                New Password
              </label>

              <div className="input-wrapper">

                <KeyRound size={18} />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    newPassword
                  }
                  placeholder="Enter new password"
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM */}

            <div className="login-field">

              <label>
                <Lock size={16} />
                Confirm Password
              </label>

              <div className="input-wrapper">

                <Lock size={18} />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  placeholder="Confirm new password"
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {changePasswordError && (
              <div className="login-error">
                {
                  changePasswordError
                }
              </div>
            )}

            {changePasswordSuccess && (
              <div className="login-success">

                <CheckCircle2 size={17} />

                {
                  changePasswordSuccess
                }

              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >

              <CheckCircle2 size={18} />

              OK

            </button>

            <button
              type="button"
              className="back-login-button"
              onClick={
                handleBackToLogin
              }
            >

              <ArrowLeft size={17} />

              Back to Login

            </button>

          </form>

          <div className="login-footer">
            
          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // NORMAL LOGIN
  // ===================================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* LOGOS */}

        <div className="login-logos">

          <div className="login-logo-box">

            <img
              src={saiLogo}
              alt="SAI Group Logo"
              className="sai-login-logo"
            />

          </div>

          <div className="login-logo-box aerostar-box">

            <img
              src={aerostarLogo}
              alt="Aerostar Logo"
              className="aerostar-login-logo"
            />

          </div>

        </div>

        {/* HEADING */}

        <div className="login-heading">

          <ShieldCheck size={28} />

          <h1>
            
          </h1>

          <p>
            
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={
            handleLogin
          }
        >

          {/* USER */}

          <div className="login-field">

            <label>

              <User size={16} />

              User ID / User Name

            </label>

            <div className="input-wrapper">

              <User size={18} />

              <input
                type="text"
                placeholder="Enter User ID"
                value={
                  username
                }
                onChange={(e) => {

                  setUsername(
                    e.target.value
                  );

                  setLoginError("");

                }}
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="login-field">

            <label>

              <Lock size={16} />

              Password

            </label>

            <div className="input-wrapper">

              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={
                  password
                }
                onChange={(e) => {

                  setPassword(
                    e.target.value
                  );

                  setLoginError("");

                }}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>

          {/* ERROR */}

          {loginError && (
            <div className="login-error">
              {
                loginError
              }
            </div>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            className="login-button"
          >

            <LogIn size={18} />

            Sign In

          </button>

          {/* CHANGE PASSWORD */}

          <button
            type="button"
            className="change-password-link"
            onClick={
              handleOpenChangePassword
            }
          >

            <KeyRound size={16} />

            Change Password

          </button>

        </form>

        <div className="login-footer">
          
        </div>

      </div>

    </div>
  );
}

export default Login;