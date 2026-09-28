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

function Login({ onLogin }) {
  // ==========================================
  // LOGIN STATES
  // ==========================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loginError, setLoginError] = useState("");

  // ==========================================
  // CHANGE PASSWORD SCREEN
  // ==========================================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showOldPassword, setShowOldPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [changePasswordError, setChangePasswordError] =
    useState("");

  const [changePasswordSuccess, setChangePasswordSuccess] =
    useState("");


  // ==========================================
  // DEFAULT LOGIN DETAILS
  // ==========================================

  const defaultUsername = "shipra";
  const defaultPassword = "12345";


  // ==========================================
  // GET CURRENT PASSWORD
  // ==========================================

  const getCurrentPassword = () => {
    return (
      localStorage.getItem("employeeMasterPassword") ||
      defaultPassword
    );
  };


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = (e) => {
    e.preventDefault();

    setLoginError("");

    const currentPassword = getCurrentPassword();

    if (
      username.trim() === defaultUsername &&
      password === currentPassword
    ) {
      localStorage.setItem(
        "employeeMasterLoggedIn",
        "true"
      );

      if (onLogin) {
        onLogin();
      }

      return;
    }

    setLoginError("Invalid username or password.");
  };


  // ==========================================
  // OPEN CHANGE PASSWORD
  // ==========================================

  const handleOpenChangePassword = () => {
    setShowChangePassword(true);

    // Username automatically
    setUsername(defaultUsername);

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setChangePasswordError("");
    setChangePasswordSuccess("");
    setLoginError("");
  };


  // ==========================================
  // CLOSE CHANGE PASSWORD
  // ==========================================

  const handleBackToLogin = () => {
    setShowChangePassword(false);

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setChangePasswordError("");
    setChangePasswordSuccess("");
  };


  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = (e) => {
    e.preventDefault();

    setChangePasswordError("");
    setChangePasswordSuccess("");

    const currentPassword = getCurrentPassword();

    // OLD PASSWORD
    if (!oldPassword) {
      setChangePasswordError(
        "Please enter old password."
      );
      return;
    }

    // CHECK OLD PASSWORD
    if (oldPassword !== currentPassword) {
      setChangePasswordError(
        "Old password is incorrect."
      );
      return;
    }

    // NEW PASSWORD
    if (!newPassword) {
      setChangePasswordError(
        "Please enter new password."
      );
      return;
    }

    // MINIMUM PASSWORD
    if (newPassword.length < 5) {
      setChangePasswordError(
        "New password must contain at least 5 characters."
      );
      return;
    }

    // CONFIRM PASSWORD
    if (!confirmPassword) {
      setChangePasswordError(
        "Please confirm new password."
      );
      return;
    }

    // MATCH CHECK
    if (newPassword !== confirmPassword) {
      setChangePasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    // SAME PASSWORD
    if (oldPassword === newPassword) {
      setChangePasswordError(
        "New password must be different from old password."
      );
      return;
    }

    // SAVE NEW PASSWORD
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

    // After 1.5 sec go back to login
    setTimeout(() => {
      setShowChangePassword(false);
      setChangePasswordSuccess("");
    }, 1500);
  };


  // ==========================================
  // CHANGE PASSWORD SCREEN
  // ==========================================

  if (showChangePassword) {
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

            <KeyRound size={28} />

            <h1>Change Password</h1>

            <p>
              Update your login password
            </p>

          </div>


          {/* CHANGE PASSWORD FORM */}

          <form
            className="login-form"
            onSubmit={handleChangePassword}
          >

            {/* USERNAME */}

            <div className="login-field">

              <label>
                <User size={16} />
                Username
              </label>

              <div className="input-wrapper">

                <User size={18} />

                <input
                  type="text"
                  value={defaultUsername}
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
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(e) =>
                    setOldPassword(e.target.value)
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
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
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


            {/* CONFIRM PASSWORD */}

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
                  placeholder="Confirm new password"
                  value={confirmPassword}
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


            {/* ERROR */}

            {changePasswordError && (
              <div className="login-error">
                {changePasswordError}
              </div>
            )}


            {/* SUCCESS */}

            {changePasswordSuccess && (
              <div className="login-success">
                <CheckCircle2 size={17} />
                {changePasswordSuccess}
              </div>
            )}


            {/* OK BUTTON */}

            <button
              type="submit"
              className="login-button"
            >
              <CheckCircle2 size={18} />
              OK
            </button>


            {/* BACK BUTTON */}

            <button
              type="button"
              className="back-login-button"
              onClick={handleBackToLogin}
            >
              <ArrowLeft size={17} />
              Back to Login
            </button>

          </form>


          {/* FOOTER */}

          <div className="login-footer">
            Employee Management System
          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // NORMAL LOGIN SCREEN
  // ==========================================

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

        

        </div>


        {/* LOGIN FORM */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* USERNAME */}

          <div className="login-field">

            <label>
              <User size={16} />
              Username
            </label>

            <div className="input-wrapper">

              <User size={18} />

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
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
              {loginError}
            </div>
          )}


          {/* SIGN IN */}

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
            onClick={handleOpenChangePassword}
          >
            <KeyRound size={16} />
            Change Password
          </button>

        </form>


        {/* LOGIN DETAILS */}

       
            
          

        </div>


        {/* FOOTER */}

       
      </div>

    
  );
}

export default Login;