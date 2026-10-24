import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaCheckCircle, FaSpinner, FaExclamationCircle } from "react-icons/fa";

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifying Payment...");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search || "";

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(search);
      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");
      const token = localStorage.getItem("token");

      if (payment_status === "cancel") {
        navigate("/cars", { replace: true });
        return;
      }

      if (!session_id) {
        setStatusMsg("No payment session id was found in the URL.");
        setIsError(true);
        return;
      }

      try {
        setStatusMsg("Confirming payment with secure dealership server...");

        const res = await axios.get(`${API_BASE}/api/payments/confirm`, {
          params: { session_id },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 15000,
        });

        if (cancelled) return;

        if (res?.data?.success || res?.data?.verified || res?.data?.status === "paid") {
          setIsSuccess(true);
          setStatusMsg("Payment confirmed successfully! Redirecting to your purchases...");
          setTimeout(() => {
            navigate("/purchases", { replace: true });
          }, 1800);
        } else {
          setIsError(true);
          setStatusMsg(res?.data?.message || "Payment verification incomplete.");
        }
      } catch (err) {
        if (cancelled) return;
        setIsError(true);
        setStatusMsg(
          err?.response?.data?.message || "There was an error verifying your payment."
        );
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [search, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 pt-28">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          {isSuccess ? (
            <FaCheckCircle className="text-5xl text-emerald-400 mx-auto mb-4 animate-bounce" />
          ) : isError ? (
            <FaExclamationCircle className="text-5xl text-rose-400 mx-auto mb-4" />
          ) : (
            <FaSpinner className="text-5xl text-cyan-400 mx-auto mb-4 animate-spin" />
          )}
          <h2 className="text-xl font-bold mb-2">
            {isSuccess ? "Payment Successful!" : isError ? "Payment Notice" : "Processing Transaction"}
          </h2>
          <p className="text-gray-300 text-sm mb-6">{statusMsg}</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/purchases"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
            >
              Go to My Purchases
            </Link>
            <Link
              to="/cars"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold transition-all border border-slate-700"
            >
              Browse Cars
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyPaymentPage;
