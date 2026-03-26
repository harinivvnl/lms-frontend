import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("STUDENT");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const payload = { username: username.trim(), password };
    try {
      const response = await api.post("/api/auth/login", payload);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      const targetRole = response.data.role || role;
      if (targetRole === "ADMIN") navigate("/admin");
      else if (targetRole === "FACULTY") navigate("/faculty");
      else navigate("/student");
    } catch (err) {
      if (!err.response) {
        setError("Backend not reachable. Start backend on port 8080.");
      } else if (err.response.status === 401) {
        setError(err?.response?.data?.message || "Invalid username or password.");
      } else if (err.response.status === 400) {
        setError(err?.response?.data?.message || "Please enter valid login details.");
      } else {
        setError(err?.response?.data?.message || "Unable to login right now. Please try again.");
      }
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if ((role === "STUDENT" || role === "FACULTY") && !department.trim()) {
      setError("Department is required for Student and Faculty.");
      return;
    }
    if ((role === "STUDENT" || role === "FACULTY") && !section.trim()) {
      setError("Section is required for Student and Faculty.");
      return;
    }
    if ((role === "STUDENT" || role === "FACULTY") && !year.trim()) {
      setError("Year is required for Student and Faculty.");
      return;
    }

    try {
      const payload = {
        username: username.trim(),
        password,
        department: department.trim(),
        section: section.trim(),
        year: year.trim()
      };
      const response = await api.post(`/api/auth/register?role=${role}`, {
        ...payload
      });
      setSuccess("Registration successful. Please login.");
      setMode("login");
      setPassword("");
      setDepartment("");
      setSection("");
      setYear("");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Try a different username.");
    }
  };

  return (
    <div className="page login-page">
      <form className="card" onSubmit={mode === "login" ? handleLogin : handleRegister}>
        <div className="login-brand-card" aria-hidden="true">
          <div className="login-brand-border" />
          <div className="login-brand-content">
            <div className="login-brand-logo">
              <div className="login-brand-logo1">
                <span className="lms-text">LMS</span>
                <span className="lms-preloader">
                  <span className="lms-crack lms-crack1" />
                  <span className="lms-crack lms-crack2" />
                  <span className="lms-crack lms-crack3" />
                  <span className="lms-crack lms-crack4" />
                  <span className="lms-crack lms-crack5" />
                </span>
              </div>
              <div className="login-brand-logo2">LEAVE MANAGEMENT</div>
              <span className="login-brand-trail" />
            </div>
            <span className="login-brand-mid-text">LMS</span>
          </div>
          <span className="login-brand-bottom-text">LEAVE MANAGEMENT</span>
        </div>
        <div className="tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>
        {success && <p className="success">{success}</p>}
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {mode === "register" && (
          <>
            <label>
              Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            {(role === "STUDENT" || role === "FACULTY") && (
              <label>
                Department
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. CSE"
                  required
                />
              </label>
            )}
            {(role === "STUDENT" || role === "FACULTY") && (
              <label>
                Section
                <input
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. A"
                  required
                />
              </label>
            )}
            {(role === "STUDENT" || role === "FACULTY") && (
              <label>
                Year
                <input
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2"
                  required
                />
              </label>
            )}
          </>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">{mode === "login" ? "Login" : "Create Account"}</button>
      </form>
    </div>
  );
}
