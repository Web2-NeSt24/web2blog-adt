import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

type Tab = "login" | "register";

const AuthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const { login, register } = useAuth();

  // State for login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // State for register
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(loginUsername, loginPassword);
      window.location.href = '/'; // Redirect to home after login
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    try {
      await register(registerUsername, registerEmail, registerPassword);
      window.location.href = '/'; // Redirect to home after registration
    } catch (err: any) {
      setRegisterError(err.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div>
      {/* Pills navs */}
      <ul className="nav nav-pills nav-justified mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "login" ? "active" : ""}`}
            id="tab-login"
            onClick={() => setActiveTab("login")}
            aria-controls="pills-login"
            aria-selected={activeTab === "login"}
            type="button"
          >
            Login
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "register" ? "active" : ""}`}
            id="tab-register"
            onClick={() => setActiveTab("register")}
            aria-controls="pills-register"
            aria-selected={activeTab === "register"}
            type="button"
          >
            Register
          </button>
        </li>
      </ul>
      {/* Pills navs */}

      {/* Pills content */}
      <div className="tab-content">
        {/* ---------- Login ---------- */}
        <div
          className={`tab-pane fade ${activeTab === "login" ? "show active" : ""}`}
          id="pills-login"
          role="tabpanel"
          aria-labelledby="tab-login"
        >
          <form onSubmit={handleLogin}>
            <div className="text-center mb-3">
              <p>Sign in with:</p>
              {["facebook-f", "google", "twitter", "github"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  data-mdb-button-init
                  data-mdb-ripple-init
                  className="btn btn-link btn-floating mx-1"
                >
                  <i className={`fab fa-${icon}`}></i>
                </button>
              ))}
            </div>

            <p className="text-center">or:</p>

            {/* Email input */}
            <div data-mdb-input-init className="form-outline mb-4">
              <input
                type="text"
                id="loginName"
                className="form-control"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                required
              />
              <label className="form-label" htmlFor="loginName">
                Email or username
              </label>
            </div>

            {/* Password input */}
            <div data-mdb-input-init className="form-outline mb-4">
              <input
                type="password"
                id="loginPassword"
                className="form-control"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
              <label className="form-label" htmlFor="loginPassword">
                Password
              </label>
            </div>

            {/* 2-column grid */}
            <div className="row mb-4">
              <div className="col-md-6 d-flex justify-content-center">
                <div className="form-check mb-3 mb-md-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="loginCheck"
                    defaultChecked
                  />
                  <label className="form-check-label" htmlFor="loginCheck">
                    Remember me
                  </label>
                </div>
              </div>

              <div className="col-md-6 d-flex justify-content-center">
                <a href="#!">Forgot password?</a>
              </div>
            </div>

            {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              data-mdb-button-init
              data-mdb-ripple-init
              className="btn btn-primary btn-block mb-4"
              disabled={loginLoading}
            >
              {loginLoading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center">
              <p>
                Not a member?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("register");
                  }}
                >
                  Register
                </a>
              </p>
            </div>
          </form>
        </div>
        {/* ---------- Register ---------- */}
        <div
          className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`}
          id="pills-register"
          role="tabpanel"
          aria-labelledby="tab-register"
        >
          <form onSubmit={handleRegister}>
            <div className="form-outline mb-4">
              <input
                type="text"
                id="registerUsername"
                className="form-control"
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value)}
                required
              />
              <label className="form-label" htmlFor="registerUsername">
                Username
              </label>
            </div>
            <div className="form-outline mb-4">
              <input
                type="email"
                id="registerEmail"
                className="form-control"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                required
              />
              <label className="form-label" htmlFor="registerEmail">
                Email
              </label>
            </div>
            <div className="form-outline mb-4">
              <input
                type="password"
                id="registerPassword"
                className="form-control"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                required
              />
              <label className="form-label" htmlFor="registerPassword">
                Password
              </label>
            </div>
            {registerError && (
              <div className="alert alert-danger" role="alert">
                {registerError}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-block mb-4"
              disabled={registerLoading}
            >
              {registerLoading ? "Registering..." : "Register"}
            </button>
            <div className="text-center">
              <p>
                Already a member?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("login");
                  }}
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;
