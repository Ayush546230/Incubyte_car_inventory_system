import { useEffect, useState } from "react";
import "./index.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ContactPage from "./pages/ContactPage";
import CarsPage from "./pages/CarsPage";
import CarDetailPage from "./pages/CarDetailPage";
import { FaArrowUp } from "react-icons/fa";
import VerifyPaymentPage from "./pages/VerifyPaymentPage";
import MyBooking from "./pages/MyBooking";

// Admin components
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AddCar from "./admin/AddCar";
import ManageCar from "./admin/ManageCar";
import Booking from "./admin/Booking";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authToken = localStorage.getItem("token");
  if (!authToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

const RedirectIfAuthenticated = ({ children }) => {
  const authToken = localStorage.getItem("token");
  if (authToken) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Admin route guards
const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const RedirectIfAdminAuthenticated = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    return <Navigate to="/admin/manage-cars" replace />;
  }
  return children;
};

function App() {
  const [showButton, setShowButton] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <MyBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-purchases"
          element={
            <ProtectedRoute>
              <MyBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthenticated>
              <Signup />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="/success" element={<VerifyPaymentPage />} />
        <Route path="/cancel" element={<VerifyPaymentPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <RedirectIfAdminAuthenticated>
              <AdminLogin />
            </RedirectIfAdminAuthenticated>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Navigate to="/admin/manage-cars" replace />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/add-car"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AddCar />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/manage-cars"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <ManageCar />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />
        {/* Route aliases for convenience */}
        <Route path="/admin/manage-car" element={<Navigate to="/admin/manage-cars" replace />} />
        <Route path="/manage-cars" element={<Navigate to="/admin/manage-cars" replace />} />
        <Route path="/managecars" element={<Navigate to="/admin/manage-cars" replace />} />
        <Route
          path="/admin/bookings"
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <Booking />
              </AdminLayout>
            </AdminProtectedRoute>
          }
        />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showButton && (
        <button
          onClick={scrollUp}
          className="fixed cursor-pointer bottom-8 right-8 p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all focus:outline-none z-40"
          aria-label="Scroll to Top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </>
  );
}

export default App;
