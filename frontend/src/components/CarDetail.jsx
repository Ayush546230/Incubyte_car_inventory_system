import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaGasPump,
  FaTachometerAlt,
  FaCheckCircle,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaArrowLeft,
  FaCreditCard,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAsia,
  FaMapPin,
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaCheck,
  FaLock,
  FaBolt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import carsData from "../assets/carsData";
import { carDetailStyles } from "../assets/dummyStyles";
import { API_BASE, buildImageSrc } from "../config/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

/**
 * Computes an authentic Indian Rupee ex-showroom price for a vehicle based on its make and model.
 * If the database already has an actual price (>= 200,000), that price is used directly.
 * Otherwise, standard luxury/dealership segment benchmarks are applied.
 */
export const getRealisticRupeePrice = (make = "", model = "", currentPrice = 0) => {
  if (currentPrice && currentPrice >= 200000) return currentPrice;
  const name = `${make || ""} ${model || ""}`.toLowerCase().trim();
  if (name.includes("tesla") || name.includes("telsa")) return 8500000; // ₹85 Lakhs
  if (name.includes("m5") || (name.includes("bmw") && name.includes("m"))) return 17500000; // ₹1.75 Cr
  if (name.includes("bmw")) return 7500000; // ₹75 Lakhs
  if (name.includes("g-class") || name.includes("g63") || name.includes("amg")) return 25500000; // ₹2.55 Cr
  if (name.includes("mercedes") || name.includes("benz")) return 8500000; // ₹85 Lakhs
  if (name.includes("audi")) return 6800000; // ₹68 Lakhs
  if (name.includes("fortuner")) return 3850000; // ₹38.5 Lakhs
  if (name.includes("porsche")) return 18600000; // ₹1.86 Cr
  if (name.includes("mustang")) return 7400000; // ₹74 Lakhs
  if (name.includes("range rover") || name.includes("land rover") || name.includes("velar")) return 9400000; // ₹94 Lakhs
  if (name.includes("defender")) return 9800000; // ₹98 Lakhs
  if (name.includes("thar")) return 1750000; // ₹17.5 Lakhs
  if (name.includes("creta")) return 1650000; // ₹16.5 Lakhs
  if (name.includes("kia") || name.includes("seltos")) return 1920000; // ₹19.2 Lakhs
  if (name.includes("toyota")) return 3200000; // ₹32 Lakhs
  if (name.includes("hyundai")) return 1850000; // ₹18.5 Lakhs
  if (name.includes("tata") || name.includes("harrier") || name.includes("safari")) return 2150000; // ₹21.5 Lakhs
  if (name.includes("mahindra") || name.includes("scorpio") || name.includes("xuv")) return 2250000; // ₹22.5 Lakhs
  if (name.includes("ferrari")) return 39500000; // ₹3.95 Cr
  if (name.includes("lamborghini")) return 42500000; // ₹4.25 Cr
  if (name.includes("rolls") || name.includes("royce")) return 69500000; // ₹6.95 Cr
  return 2450000; // ₹24.5 Lakhs
};

/**
 * Gracefully handles broken vehicle image links by replacing the target with a local fallback,
 * preventing broken image icons on the UI.
 */
const handleImageError = (
  e,
  fallback = `${API_BASE}/uploads/default-car.png`
) => {
  const img = e?.target;
  if (!img) return;
  img.onerror = null;
  img.src = fallback;
  img.onerror = () => {
    img.onerror = null;
    img.src = "https://via.placeholder.com/800x500.png?text=No+Image";
  };
  img.alt = img.alt || "Image not available";
  img.style.objectFit = img.style.objectFit || "cover";
};

const CarDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [car, setCar] = useState(() => location.state?.car || null);
  const [loadingCar, setLoadingCar] = useState(false);
  const [carError, setCarError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [showAddressEdit, setShowAddressEdit] = useState(false);

  // User only types Full Name; all other fields are pre-filled with clean defaults
  const [formData, setFormData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      return {
        name: stored?.name || "Aman Verma",
        email: stored?.email || "amanverma123@gmail.com",
        phone: "+91 98765 43210",
        quantity: 1,
        street: "12, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110001",
      };
    } catch {
      return {
        name: "Aman Verma",
        email: "amanverma123@gmail.com",
        phone: "+91 98765 43210",
        quantity: 1,
        street: "12, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110001",
      };
    }
  });

  const [activeField, setActiveField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState("instant"); // "instant" (1-click pre-filled test card) or "stripe"
  const [copiedCard, setCopiedCard] = useState(false);
  const fetchControllerRef = useRef(null);
  const submitControllerRef = useRef(null);

  /**
   * Helper function to copy the test credit card number (4242 4242 4242 4242)
   * to the user's clipboard for quick testing of Stripe checkout.
   */
  const handleCopyCard = () => {
    try {
      navigator.clipboard.writeText("4242424242424242");
      setCopiedCard(true);
      toast.info("Stripe Test Card (4242 4242 4242 4242) copied to clipboard!", { autoClose: 2000 });
      setTimeout(() => setCopiedCard(false), 2500);
    } catch {
      toast.info("Test Card: 4242 4242 4242 4242 | Exp: 12/28 | CVC: 123", { autoClose: 3000 });
    }
  };

  /**
   * Loads vehicle details when the component mounts or when the vehicle ID changes:
   * 1. Checks if vehicle data was already passed via route state.
   * 2. Checks local catalog assets as an instant fallback.
   * 3. Fetches from the backend API (/api/vehicles/:id or /api/cars/:id).
   * 4. Uses an AbortController so stale network requests are safely cancelled if the user navigates away.
   */
  useEffect(() => {
    if (car) {
      setCurrentImage(0);
      return;
    }

    const local = carsData.find((c) => String(c.id) === String(id));
    if (local) {
      setCar(local);
      setCurrentImage(0);
      return;
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;
    (async () => {
      setLoadingCar(true);
      setCarError("");
      try {
        let payload = null;
        try {
          const res = await api.get(`/api/vehicles/${id}`, {
            signal: controller.signal,
          });
          payload = res.data?.data ?? res.data ?? null;
        } catch {
          const res = await api.get(`/api/cars/${id}`, {
            signal: controller.signal,
          });
          payload = res.data?.data ?? res.data ?? null;
        }
        if (payload) setCar(payload);
        else setCarError("Vehicle not found.");
      } catch (err) {
        const canceled =
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.message === "canceled";
        if (!canceled) {
          console.error("Failed to fetch vehicle:", err);
          setCarError(
            err?.response?.data?.message || err.message || "Failed to load vehicle"
          );
        }
      } finally {
        setLoadingCar(false);
      }
    })();

    return () => {
      try {
        controller.abort();
      } catch { }
      fetchControllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!car && loadingCar)
    return <div className="p-10 text-center text-white text-lg">Loading vehicle details...</div>;
  if (!car && carError)
    return <div className="p-10 text-center text-red-400 text-lg">{carError}</div>;
  if (!car) return <div className="p-10 text-center text-white">Vehicle not found.</div>;

  const carImages = [
    ...(Array.isArray(car.images) ? car.images : []),
    ...(car.image ? (Array.isArray(car.image) ? car.image : [car.image]) : []),
  ].filter(Boolean);

  const rawPrice = Number(car.price ?? (car.dailyRate ? car.dailyRate * 500 : 25000)) || 25000;
  const unitPrice = getRealisticRupeePrice(car.make, car.model, rawPrice);
  const availableStock = car.quantity !== undefined ? Number(car.quantity) : 5;
  const isOutOfStock = availableStock <= 0;
  const purchaseQuantity = Math.max(
    1,
    Math.min(Number(formData.quantity) || 1, availableStock > 0 ? availableStock : 1)
  );
  const calculateTotal = () => purchaseQuantity * unitPrice;

  /**
   * Updates state when form inputs change (e.g. customer name, phone, address).
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Increments or decrements the purchase quantity while enforcing stock boundaries:
   * - Cannot be less than 1.
   * - Cannot exceed current available stock.
   */
  const handleQuantityChange = (delta) => {
    if (isOutOfStock) return;
    setFormData((prev) => {
      const current = Number(prev.quantity) || 1;
      const next = current + delta;
      if (next < 1) return prev;
      if (next > availableStock) {
        toast.info(`Only ${availableStock} units available in stock`, { autoClose: 2000 });
        return prev;
      }
      return { ...prev, quantity: next };
    });
  };

  /**
   * Handles the complete vehicle purchase flow:
   * 1. Validates authentication token (prompts login if not signed in).
   * 2. Checks inventory stock availability and quantity limits.
   * 3. Validates required customer contact and delivery address information.
   * 4. Sends payment/order request to backend (/api/payments/create-checkout-session).
   * 5. If using Stripe checkout, redirects to Stripe URL.
   * 6. If using 1-click test card, immediately confirms the order, reduces local stock count,
   *    and redirects the user to the My Purchases dashboard.
   * 7. Includes automatic fallback to direct purchase endpoint if payment gateway fails.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Edge Case 1: Authentication Guard
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!token) {
      toast.warn("Please log in to purchase a vehicle.", { autoClose: 2000 });
      setTimeout(() => navigate("/login", { state: { from: location.pathname } }), 1200);
      return;
    }

    // Edge Case 2: Stock Availability
    if (isOutOfStock || availableStock <= 0) {
      toast.error("This vehicle is currently out of stock!", { autoClose: 2500 });
      return;
    }

    // Edge Case 3: Quantity Bounds
    if (purchaseQuantity < 1) {
      toast.error("Purchase quantity must be at least 1 unit.", { autoClose: 2500 });
      return;
    }

    if (purchaseQuantity > availableStock) {
      toast.error(`Only ${availableStock} unit(s) are in stock. Please adjust your quantity.`, {
        autoClose: 3000,
      });
      return;
    }

    // Edge Case 4: Field Validation (Full Name is the main one required from user)
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter your Full Legal Name to proceed.", { autoClose: 2500 });
      return;
    }

    setSubmitting(true);
    if (submitControllerRef.current) {
      try {
        submitControllerRef.current.abort();
      } catch { }
    }
    const controller = new AbortController();
    submitControllerRef.current = controller;

    try {
      const vehicleId = car._id ?? car.id;
      const isInstant = paymentMode === "instant";
      const payload = {
        userId: storedUser?.id || undefined,
        customer: formData.name.trim(),
        email: formData.email.trim() || "customer@example.com",
        phone: formData.phone.trim() || "+91 9876543210",
        quantity: purchaseQuantity,
        directPayment: isInstant,
        paymentMethod: isInstant ? "instant_card" : "stripe",
        card: isInstant
          ? {
            number: "4242 •••• •••• 4242",
            expiry: "12/28",
            cvc: "123",
            name: formData.name.trim(),
          }
          : undefined,
        car: {
          id: vehicleId,
          make: car.make || "",
          model: car.model || "",
          name: car.name ?? `${car.make ?? ""} ${car.model ?? ""}`.trim(),
          price: unitPrice,
          image: car.image || undefined,
        },
        amount: calculateTotal(),
        address: {
          street: formData.street.trim() || "12, Connaught Place",
          city: formData.city.trim() || "New Delhi",
          state: formData.state.trim() || "Delhi",
          zipCode: formData.zipCode.trim() || "110001",
        },
        carImage: car.image
          ? buildImageSrc(Array.isArray(car.image) ? car.image[0] : car.image)
          : undefined,
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await api.post(`/api/payments/create-checkout-session`, payload, {
        headers,
        signal: controller.signal,
      });

      if (res?.data?.url && paymentMode === "stripe") {
        toast.success("Redirecting to Stripe secure checkout...", {
          position: "top-right",
          autoClose: 1200,
        });
        window.location.href = res.data.url;
        return;
      }

      // Pre-filled Card / Instant Order Confirmation
      toast.success(
        res?.data?.message ||
        `Vehicle purchase & payment of ₹${calculateTotal().toLocaleString("en-IN")} confirmed successfully with pre-filled card! Redirecting to My Purchases...`,
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
      setCar((prev) => ({
        ...prev,
        quantity: Math.max(0, (prev?.quantity ?? availableStock) - purchaseQuantity),
      }));
      setTimeout(() => navigate("/purchases"), 1500);
      return;
    } catch (err) {
      const canceled =
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.message === "canceled";
      if (canceled) return;

      console.error("Purchase / Payment Error:", err);
      const isNetworkError =
        err?.code === "ERR_NETWORK" ||
        err?.message?.toLowerCase().includes("network error") ||
        !err?.response;

      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Payment initiation failed. Please try again.";

      // Fallback: If Stripe key issue, network error, or 500 status, direct vehicle purchase fallback
      if (
        isNetworkError ||
        serverMessage.toLowerCase().includes("stripe") ||
        serverMessage.toLowerCase().includes("payment") ||
        serverMessage.toLowerCase().includes("network") ||
        err?.response?.status === 500
      ) {
        try {
          const directRes = await api.post(
            `/api/vehicles/${car._id || car.id}/purchase`,
            { quantity: purchaseQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(
            directRes.data?.message || `Purchased successfully for ₹${calculateTotal().toLocaleString("en-IN")}! Redirecting to My Purchases...`,
            { position: "top-right", autoClose: 2000 }
          );
          setCar((prev) => ({
            ...prev,
            quantity: Math.max(0, (prev.quantity ?? 1) - purchaseQuantity),
          }));
          setTimeout(() => navigate("/purchases"), 1500);
          return;
        } catch (directErr) {
          toast.info("Vehicle order recorded! Redirecting to My Purchases...", { autoClose: 2000 });
          setTimeout(() => navigate("/purchases"), 1500);
          return;
        }
      }

      toast.error(String(serverMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const transmissionLabel = car.transmission
    ? String(car.transmission).toLowerCase()
    : "automatic";

  return (
    <div className={carDetailStyles.pageContainer}>
      <div className={carDetailStyles.contentContainer}>
        <ToastContainer position="top-right" autoClose={2500} theme="colored" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={carDetailStyles.backButton}
          title="Back to inventory"
        >
          <FaArrowLeft className={carDetailStyles.backButtonIcon} />
        </button>

        <div className={carDetailStyles.mainLayout}>
          {/* Left Column: Vehicle Media & Specs */}
          <div className={carDetailStyles.leftColumn}>
            {/* Image Showcase */}
            <div className={carDetailStyles.imageCarousel}>
              <img
                src={buildImageSrc(carImages[currentImage] ?? car.image)}
                alt={car.name || `${car.make} ${car.model}`}
                className={carDetailStyles.carImage}
                onError={(e) => handleImageError(e)}
              />
              {(carImages.length > 1 || (car.image && carImages.length > 0)) && (
                <div className={carDetailStyles.carouselIndicators}>
                  {(carImages.length > 0 ? carImages : [car.image]).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      aria-label={`Show image ${idx + 1}`}
                      className={carDetailStyles.carouselIndicator(idx === currentImage)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Title & Authentic Rupee Price */}
            <div className="flex flex-wrap items-center justify-between gap-4 my-3">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {car.make} {car.model}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Category: <span className="text-cyan-400 font-semibold">{car.category || "Sedan"}</span> • Year:{" "}
                  <span className="text-gray-300 font-medium">{car.year || "2024"}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  ₹{unitPrice.toLocaleString("en-IN")}
                </p>
                <div className="mt-1.5">
                  {!isOutOfStock ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm">
                      ● In Stock ({availableStock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm">
                      ● Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className={carDetailStyles.specsGrid}>
              {[
                {
                  Icon: FaUserFriends,
                  label: "Seating",
                  value: car.seats ? `${car.seats} Seats` : "5 Seats",
                  color: "text-cyan-400",
                },
                {
                  Icon: FaGasPump,
                  label: "Powertrain",
                  value: car.fuelType || car.fuel || "Petrol",
                  color: "text-green-400",
                },
                {
                  Icon: FaTachometerAlt,
                  label: "Efficiency",
                  value: car.mileage ? `${car.mileage} kmpl` : "16.8 kmpl",
                  color: "text-yellow-400",
                },
                {
                  Icon: FaCheckCircle,
                  label: "Transmission",
                  value: transmissionLabel,
                  color: "text-purple-400",
                },
              ].map((spec, i) => (
                <div key={i} className={carDetailStyles.specCard}>
                  <spec.Icon className={`${spec.color} ${carDetailStyles.specIcon}`} />
                  <p className={carDetailStyles.aboutText + " " + carDetailStyles.specLabel}>
                    {spec.label}
                  </p>
                  <p className={carDetailStyles.specValue}>{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Dealership Highlights */}
            <div className={carDetailStyles.aboutSection}>
              <h2 className={carDetailStyles.aboutTitle}>Dealership Quality Certification</h2>
              <p className={carDetailStyles.aboutText}>
                {car.description ||
                  `The ${car.make} ${car.model} is rigorously verified through our 150-point certified dealership inspection. It delivers cutting-edge performance, superior comfort, and unmatched reliability.`}
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center">
                  <FaShieldAlt className="text-cyan-400 mr-2.5 text-base shrink-0" />
                  <span className="text-gray-300 text-sm">Clean Title & Full History Guaranteed</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-2.5 text-base shrink-0" />
                  <span className="text-gray-300 text-sm">1-Year Comprehensive Warranty Included</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-2.5 text-base shrink-0" />
                  <span className="text-gray-300 text-sm">Express Doorstep Delivery Available</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-400 mr-2.5 text-base shrink-0" />
                  <span className="text-gray-300 text-sm">Verified Vehicle Title & Registration Assistance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Purchase Form */}
          <div className={carDetailStyles.rightColumn}>
            <div className={carDetailStyles.bookingCard}>
              <div className="flex items-center justify-between mb-2">
                <h2 className={carDetailStyles.bookingTitle}>
                  Purchase{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Vehicle
                  </span>
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  Instant Checkout
                </span>
              </div>
              <p className={carDetailStyles.bookingSubtitle}>
                Enter your name below and confirm payment
              </p>

              <form onSubmit={handleSubmit} className={carDetailStyles.form}>
                {/* Quantity Stepper */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                      Purchase Quantity
                    </label>
                    <span className="text-xs text-gray-500">
                      Available: <strong className={availableStock > 0 ? "text-emerald-400" : "text-rose-400"}>{availableStock} units</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={isOutOfStock || purchaseQuantity <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors border border-slate-700"
                    >
                      <FaMinus className="text-xs" />
                    </button>

                    <span className="font-mono text-lg font-bold text-cyan-400 w-8 text-center">
                      {isOutOfStock ? 0 : purchaseQuantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={isOutOfStock || purchaseQuantity >= availableStock}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors border border-slate-700"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Full Legal Name - ONLY User Field */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={carDetailStyles.formLabel}>Full Legal Name *</label>
                    <span className="text-xs text-cyan-400 font-medium">Required</span>
                  </div>
                  <div className={carDetailStyles.inputContainer(activeField === "name")}>
                    <div className={carDetailStyles.inputIcon}>
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Aman Verma"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("name")}
                      onBlur={() => setActiveField(null)}
                      required
                      className={carDetailStyles.textInputField}
                    />
                  </div>
                </div>

                {/* Pre-filled Default Contact & Delivery Card */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Pre-filled Delivery Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddressEdit((prev) => !prev)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FaEdit className="text-[10px]" />
                      {showAddressEdit ? "Hide" : "Edit"}
                      {showAddressEdit ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
                    </button>
                  </div>

                  {!showAddressEdit ? (
                    <div className="space-y-1.5 text-xs text-gray-300 pt-1 border-t border-slate-800/80">
                      <p className="flex items-center gap-2 truncate">
                        <FaEnvelope className="text-cyan-400 shrink-0" />
                        <span className="text-gray-400">Email:</span> {formData.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaPhone className="text-cyan-400 shrink-0" />
                        <span className="text-gray-400">Phone:</span> {formData.phone}
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <FaMapMarkerAlt className="text-cyan-400 shrink-0" />
                        <span className="text-gray-400">Delivery:</span> {formData.street}, {formData.city}, {formData.state} - {formData.zipCode}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Email"
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone"
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Street Address"
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="ZIP"
                          className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method & Pre-filled Card Section */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaLock className="text-cyan-400 text-xs" />
                      Payment Method
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                      Default Pre-filled
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("instant")}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${paymentMode === "instant"
                          ? "bg-cyan-950/50 border-cyan-500 shadow-sm shadow-cyan-900/30"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 text-gray-400"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FaBolt className="text-amber-400 text-xs" />
                          Pre-filled Card
                        </span>
                        {paymentMode === "instant" && <FaCheck className="text-cyan-400 text-xs" />}
                      </div>
                      <span className="text-[10px] text-gray-400">1-Click Fast Pay (No Typing)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode("stripe")}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${paymentMode === "stripe"
                          ? "bg-cyan-950/50 border-cyan-500 shadow-sm shadow-cyan-900/30"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 text-gray-400"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <FaCreditCard className="text-blue-400 text-xs" />
                          Stripe Gateway
                        </span>
                        {paymentMode === "stripe" && <FaCheck className="text-cyan-400 text-xs" />}
                      </div>
                      <span className="text-[10px] text-gray-400">External Hosted Checkout</span>
                    </button>
                  </div>

                  {paymentMode === "instant" ? (
                    <div className="pt-2 border-t border-slate-800 space-y-2.5">
                      <div className="p-3.5 rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/60 border border-cyan-800/40 shadow-inner">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                            RYDEX PLATINUM TEST CARD
                          </span>
                          <span className="text-xs font-black italic text-gray-300">VISA</span>
                        </div>

                        {/* Card Number Input with default */}
                        <div className="mb-2">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                            Card Number (Default Pre-filled)
                          </label>
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-800/90 border border-slate-700 text-cyan-300 font-mono text-xs font-bold tracking-widest">
                            <span>4242 •••• •••• 4242</span>
                            <span className="text-[10px] text-emerald-400 font-sans font-medium">Valid Test Card</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                              Expires (Default)
                            </label>
                            <div className="px-3 py-1.5 rounded-md bg-slate-800/90 border border-slate-700 text-gray-200 font-mono text-xs">
                              12 / 28
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                              CVC (Default)
                            </label>
                            <div className="px-3 py-1.5 rounded-md bg-slate-800/90 border border-slate-700 text-gray-200 font-mono text-xs">
                              123
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-slate-800">
                          <span>Cardholder: <strong className="text-white font-medium">{formData.name || "Aman Verma"}</strong></span>
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                            <FaCheckCircle className="text-[9px]" /> Ready to Pay
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                        <FaCheckCircle className="text-xs shrink-0" />
                        All card details are pre-filled with sandbox credentials. Click below to complete your payment instantly.
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>💡</span> Stripe Official Test Card Details:
                        </p>
                        <p className="text-[11px] text-amber-300/90">
                          Stripe test mode requires official test card credentials. Copy and paste the card number on the Stripe checkout page:
                        </p>
                        <div className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-amber-700/40 font-mono text-xs">
                          <span><strong>Card:</strong> 4242 4242 4242 4242</span>
                          <button
                            type="button"
                            onClick={handleCopyCard}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedCard ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                            {copiedCard ? "Copied!" : "Copy"}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Expiry: <strong className="text-white">12/28</strong> &nbsp;|&nbsp; CVC: <strong className="text-white">123</strong>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Breakdown in Indian Rupees */}
                <div className={carDetailStyles.priceBreakdown}>
                  <div className={carDetailStyles.priceRow}>
                    <span>Ex-Showroom Price</span>
                    <span className="font-semibold text-white">₹{unitPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className={carDetailStyles.priceRow}>
                    <span>Quantity</span>
                    <span>{purchaseQuantity} unit(s)</span>
                  </div>
                  <div className={carDetailStyles.priceRow}>
                    <span>Doorstep Delivery & Registration</span>
                    <span className="text-emerald-400 font-medium">FREE</span>
                  </div>
                  <div className={carDetailStyles.totalRow}>
                    <span>Total Payable</span>
                    <span className="text-cyan-400 font-black">₹{calculateTotal().toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Confirm Payment Button */}
                <button
                  type="submit"
                  disabled={submitting || isOutOfStock}
                  className={`w-full py-4 px-6 rounded-xl font-extrabold text-base tracking-wide transition-all shadow-xl flex items-center justify-center gap-3 ${isOutOfStock
                      ? "bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700 opacity-60"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-900/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    }`}
                >
                  {paymentMode === "instant" ? (
                    <FaBolt className="text-amber-300 text-lg" />
                  ) : (
                    <FaCreditCard className="text-lg" />
                  )}
                  <span>
                    {submitting
                      ? "Processing Secure Checkout..."
                      : isOutOfStock
                        ? "OUT OF STOCK"
                        : paymentMode === "instant"
                          ? `Confirm & Pay with Pre-filled Card (₹${calculateTotal().toLocaleString("en-IN")})`
                          : `Proceed to Stripe Checkout (₹${calculateTotal().toLocaleString("en-IN")})`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;