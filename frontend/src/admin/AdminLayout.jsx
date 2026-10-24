// frontend/src/admin/AdminLayout.jsx
import React from "react";
import AdminNavbar from "./AdminNavbar";
import { ToastContainer } from "react-toastify";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <AdminNavbar />
      <main className="w-full">
        {children}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default AdminLayout;
