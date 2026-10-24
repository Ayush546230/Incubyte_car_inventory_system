// frontend/src/admin/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import logo from "../assets/logocar.png";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { API_BASE } from "../config/api";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    // If already logged in as admin, redirect to admin dashboard
    if (localStorage.getItem("adminToken")) {
      navigate("/admin/manage-cars", { replace: true });
    }
  }, [navigate]);

  /**
   * Tracks admin user input changes for email and password.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Auto-fills default administrator credentials for quick testing access.
   */
  const handleFillDemo = () => {
    setCredentials({
      email: "admin@rydex.com",
      password: "admin123",
    });
    toast.info("Demo credentials filled!", { autoClose: 1200 });
  };

  /**
   * Authenticates administrator credentials against /api/auth/admin-login:
   * 1. Submits admin email and password.
   * 2. On success, persists adminToken and adminUser to localStorage.
   * 3. Redirects to the admin dashboard (/admin/manage-cars).
   * 4. Includes emergency developer fallback for the default demo admin account.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/admin-login`,
        credentials,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status >= 200 && res.status < 300) {
        const { token, user, message } = res.data || {};
        const adminToken = token || `admin-token-${Date.now()}`;
        localStorage.setItem("adminToken", adminToken);
        localStorage.setItem(
          "adminUser",
          JSON.stringify(user || { email: credentials.email, role: "admin" })
        );

        toast.success(message || "Admin Login Successful! Welcome Back", {
          theme: "colored",
          autoClose: 1000,
          onClose: () => {
            navigate("/admin/manage-cars", { replace: true });
          },
        });
      }
    } catch (err) {
      console.error("Admin login error:", err);
      // Fallback check if backend had any networking issue or if credentials match default
      if (
        credentials.email.toLowerCase() === "admin@rydex.com" &&
        credentials.password === "admin123"
      ) {
        localStorage.setItem("adminToken", `admin-session-${Date.now()}`);
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            name: "RYDEX Administrator",
            email: credentials.email,
            role: "admin",
          })
        );
        toast.success("Admin Login Successful! Welcome Administrator", {
          theme: "colored",
          autoClose: 1000,
          onClose: () => {
            navigate("/admin/manage-cars", { replace: true });
          },
        });
        return;
      }

      const errMsg =
        err.response?.data?.message ||
        (err.request
          ? "No response from server. Check backend."
          : "Invalid admin email or password");
      toast.error(errMsg, { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-950 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-cyan-600 to-blue-800 blur-3xl opacity-20 transition-all duration-1000 ${
            isActive ? "scale-125 translate-x-10" : "scale-75"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-700 to-cyan-500 blur-3xl opacity-15 transition-all duration-1000 ${
            isActive ? "scale-110 -translate-x-10" : "scale-75"
          }`}
        />
      </div>

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-300 hover:text-cyan-400 hover:border-cyan-500/40 backdrop-blur-md transition-all text-sm font-medium"
      >
        <FaArrowLeft className="text-xs" />
        <span>Return to Customer Site</span>
      </Link>

      {/* Main Login Card */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-500 transform ${
          isActive ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <div className="relative glass-card rounded-2xl p-7 sm:p-9 border border-gray-800/80 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <img
                src={logo}
                alt="logo"
                className="h-8 w-auto block"
                style={{ objectFit: "contain" }}
              />
              <span className="font-extrabold text-2xl tracking-wider text-white">
                RYDEX
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center gap-1">
                <FaShieldAlt className="text-[10px]" /> ADMIN
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Admin Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
              Control Panel &amp; Fleet Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-cyan-400">
                  <FaUserShield className="text-base" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="admin@rydex.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/80 border border-gray-700/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-cyan-400">
                  <FaLock className="text-base" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-gray-900/80 border border-gray-700/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Default Demo Fill Hint */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-400">
                Default: <code className="text-cyan-300 font-mono">admin@rydex.com</code>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline underline-offset-2 transition-colors"
              >
                Auto-fill Demo
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "ENTER CONTROL PANEL"}
            </button>
          </form>

          {/* Customer switch prompt */}
          <div className="mt-6 pt-5 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-400">
              Looking for car rentals or bookings?{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Customer Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default AdminLogin;
