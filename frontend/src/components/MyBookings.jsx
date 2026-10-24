// src/components/MyBookings.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaCar,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUser,
  FaCreditCard,
  FaReceipt,
  FaArrowRight,
  FaPrint,
  FaTruck,
  FaShieldAlt,
  FaBox,
} from "react-icons/fa";
import { myBookingsStyles as s } from "../assets/dummyStyles";
import { getRealisticRupeePrice } from "./CarDetail";
import { API_BASE, buildImageSrc } from "../config/api";

const TIMEOUT = 15000;

// Helper functions for safe data extraction and formatting
const safeAccess = (fn, fallback = "") => {
  try {
    const v = fn();
    return v === undefined || v === null ? fallback : v;
  } catch {
    return fallback;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? String(dateString)
    : d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
};

const formatPrice = (price) => {
  const num = typeof price === "number" ? price : Number(price) || 0;
  return `₹${num.toLocaleString("en-IN")}`;
};

const normalizeBooking = (booking) => {
  const getCarData = () => {
    if (!booking) return {};
    if (typeof booking.car === "string") return { name: booking.car };
    if (booking.car && typeof booking.car === "object") {
      const snapshot = { ...booking.car };
      if (snapshot.id && typeof snapshot.id === "object") {
        const populated = { ...snapshot.id };
        delete snapshot.id;
        return { ...snapshot, ...populated };
      }
      return snapshot;
    }
    return {};
  };

  const carObj = getCarData();
  const details = booking.details || {};
  const address = booking.address || {};

  const make = carObj.make || carObj.name || "Dealership Vehicle";
  const model = carObj.model || "";
  const title = model ? `${make} ${model}`.trim() : make;

  let image =
    safeAccess(() => booking.carImage) ||
    safeAccess(() => carObj.image) ||
    "";
  if (!image || image === "undefined" || image === "null") {
    image = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";
  } else {
    image = buildImageSrc(image);
  }

  const quantity = Number(booking.quantity) || 1;
  const rawTotal = Number(booking.amount || booking.price || booking.total || 0);
  const rawUnitPrice = carObj.price
    ? Number(carObj.price)
    : rawTotal > 0
      ? Math.round(rawTotal / quantity)
      : 2500000;
  const unitPrice = getRealisticRupeePrice(make, model, rawUnitPrice);
  const totalPrice = rawTotal >= 200000 ? rawTotal : unitPrice * quantity;

  const purchaseDate =
    booking.createdAt ||
    booking.bookingDate ||
    booking.pickupDate ||
    Date.now();

  const formattedAddress = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ") || "12, Connaught Place, New Delhi, Delhi - 110001";

  const status =
    booking.paymentStatus === "paid" ||
      booking.status === "confirmed" ||
      booking.status === "completed"
      ? "confirmed"
      : booking.status === "cancelled"
        ? "cancelled"
        : "pending";

  const bookingIdStr = String(booking._id || booking.id || Math.random());
  const orderId = `ORD-${bookingIdStr.slice(-8).toUpperCase()}`;

  return {
    id: bookingIdStr,
    orderId,
    car: {
      make,
      model,
      title,
      image,
      year: carObj.year || 2024,
      category: carObj.category || "Luxury",
      seats: details.seats || carObj.seats || 5,
      transmission: details.transmission || carObj.transmission || "Automatic",
      fuelType: details.fuelType || carObj.fuelType || "Petrol / Electric",
      mileage: details.mileage || carObj.mileage || "16 km/l",
      unitPrice,
    },
    user: {
      name: booking.customer || safeAccess(() => booking.user?.name) || "Customer",
      email: booking.email || safeAccess(() => booking.user?.email) || "customer@example.com",
      phone: booking.phone || safeAccess(() => booking.user?.phone) || "+91 98765 43210",
      address: formattedAddress,
      city: address.city || "New Delhi",
    },
    quantity,
    price: totalPrice || unitPrice * quantity,
    status,
    purchaseDate,
    paymentStatus: booking.paymentStatus || "paid",
    paymentMethod: booking.paymentMethod || "Credit Card (Instant Online)",
    paymentId:
      booking.paymentIntentId ||
      booking.sessionId ||
      booking.stripeSession?.id ||
      `TXN-${bookingIdStr.slice(-8).toUpperCase()}`,
    raw: booking,
  };
};

// Small presentational subcomponents
const FilterButton = ({ filterKey, currentFilter, icon, label, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(filterKey)}
    className={s.filterButton(currentFilter === filterKey, filterKey)}
  >
    {icon} {label}
  </button>
);

const PurchaseStatusBadge = ({ status }) => {
  const map = {
    confirmed: {
      text: "Order Confirmed & Paid",
      color: "bg-emerald-600/90 border border-emerald-500/50 text-white",
      icon: <FaCheckCircle className="text-emerald-200" />,
    },
    pending: {
      text: "Order Processing",
      color: "bg-amber-600/90 border border-amber-500/50 text-white",
      icon: <FaClock className="text-amber-200" />,
    },
    cancelled: {
      text: "Cancelled",
      color: "bg-rose-600/90 border border-rose-500/50 text-white",
      icon: <FaTimesCircle className="text-rose-200" />,
    },
  };
  const { text, color, icon } = map[status] || map.confirmed;
  return (
    <div
      className={`${color} px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold shadow-sm`}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
};

const PurchaseCard = ({ purchase, onViewDetails }) => {
  return (
    <div className={s.bookingCard}>
      <div className={s.cardImageContainer}>
        <img
          src={purchase.car.image}
          alt={purchase.car.title}
          className={s.cardImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-cyan-400 border border-cyan-800/60">
          {purchase.orderId}
        </div>
        <div className="absolute bottom-3 right-3 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-700/60">
          {purchase.quantity} Unit{purchase.quantity > 1 ? "s" : ""}
        </div>
      </div>

      <div className={s.cardContent}>
        <div className={s.cardHeader}>
          <div>
            <h3 className={s.carTitle}>{purchase.car.title}</h3>
            <p className={s.carSubtitle}>
              {purchase.car.category} • {purchase.car.year} • {purchase.car.transmission}
            </p>
          </div>
          <div className="text-right">
            <p className={s.priceText}>{formatPrice(purchase.price)}</p>
            <p className="text-[11px] text-gray-400 font-medium">Total Paid</p>
          </div>
        </div>

        <div className="mb-3">
          <PurchaseStatusBadge status={purchase.status} />
        </div>

        <div className={s.detailSection}>
          <div className={s.detailItem}>
            <div className={s.detailIcon}>
              <FaCalendarAlt />
            </div>
            <div className="overflow-hidden">
              <p className={s.detailLabel}>Purchase Date</p>
              <p className={s.detailValue}>{formatDate(purchase.purchaseDate)}</p>
            </div>
          </div>

          <div className={s.detailItem}>
            <div className={s.detailIcon}>
              <FaTruck />
            </div>
            <div className="overflow-hidden">
              <p className={s.detailLabel}>Doorstep Delivery</p>
              <p className={`${s.detailValue} text-xs truncate`} title={purchase.user.address}>
                {purchase.user.address}
              </p>
            </div>
          </div>

          <div className={s.detailItem}>
            <div className={s.detailIcon}>
              <FaUser />
            </div>
            <div className="overflow-hidden">
              <p className={s.detailLabel}>Registered Owner</p>
              <p className={s.detailValue}>
                {purchase.user.name} <span className="text-xs text-gray-400">({purchase.user.phone})</span>
              </p>
            </div>
          </div>
        </div>

        <div className={s.cardActions}>
          <button
            type="button"
            onClick={() => onViewDetails(purchase)}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <FaReceipt /> View Purchase Invoice
          </button>
          <Link
            to="/cars"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
          >
            <FaCar /> Browse
          </Link>
        </div>
      </div>
    </div>
  );
};

const PurchaseInvoiceModal = ({ purchase, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={s.modalOverlay}>
      <div className={s.modalContainer}>
        <div className={s.modalContent}>
          {/* Header */}
          <div className={s.modalHeader}>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/50">
                Official Dealership Tax Invoice
              </span>
              <h2 className="text-2xl font-black mt-2 flex items-center gap-2 text-white">
                <FaReceipt className="text-cyan-400" /> {purchase.orderId}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print / Save PDF"
              >
                <FaPrint className="text-xs" /> Print
              </button>
              <button
                type="button"
                onClick={onClose}
                className={s.modalCloseButton}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Vehicle Highlights */}
          <div className={s.modalGrid}>
            <div>
              <img
                src={purchase.car.image}
                alt={purchase.car.title}
                className={s.carImageModal}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>

            <div>
              <h3 className={s.carTitle}>{purchase.car.title}</h3>
              <div className={s.carTags}>
                <span className={s.carTag}>{purchase.car.category}</span>
                <span className={s.carTag}>Year {purchase.car.year}</span>
                <span className={s.carTag}>{purchase.car.seats} Seats</span>
                <span className={s.carTag}>{purchase.car.transmission}</span>
              </div>

              <div className={s.infoGrid}>
                <div>
                  <p className={s.infoLabel}>Fuel Type</p>
                  <p className={s.infoValue}>{purchase.car.fuelType}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Mileage</p>
                  <p className={s.infoValue}>{purchase.car.mileage}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Units Purchased</p>
                  <p className="font-bold text-emerald-400">
                    {purchase.quantity} Unit{purchase.quantity > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className={s.infoLabel}>Total Investment</p>
                  <p className={s.priceValue}>{formatPrice(purchase.price)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column Order & Delivery Details */}
          <div className={s.modalGrid}>
            <div className="space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-cyan-300">
                <FaTruck className="text-cyan-400" /> Doorstep Delivery Details
              </h3>
              <div className={s.infoCard}>
                <div className="mb-2.5">
                  <p className={s.infoLabel}>Delivery Address:</p>
                  <p className="font-medium text-white text-xs mt-0.5">
                    {purchase.user.address}
                  </p>
                </div>
                <div className="mb-2.5">
                  <p className={s.infoLabel}>Delivery Speed:</p>
                  <p className="font-semibold text-emerald-400 text-xs">
                    Express Dealership Transport (FREE)
                  </p>
                </div>
                <div>
                  <p className={s.infoLabel}>Registration & Paperwork:</p>
                  <p className="text-xs text-gray-300">
                    Full RTO Assistance & 1-Year Comprehensive Warranty Included
                  </p>
                </div>
              </div>

              <h3 className="text-base font-bold flex items-center gap-2 mt-4 text-cyan-300">
                <FaCalendarAlt className="text-cyan-400" /> Order Timeline
              </h3>
              <div className={s.infoCard}>
                <div className={s.infoRow}>
                  <p className={s.infoLabel}>Order Placed Date:</p>
                  <p className={s.infoValue}>{formatDate(purchase.purchaseDate)}</p>
                </div>
                <div className={s.infoRow}>
                  <p className={s.infoLabel}>Order Status:</p>
                  <PurchaseStatusBadge status={purchase.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-cyan-300">
                <FaUser className="text-cyan-400" /> Registered Owner
              </h3>
              <div className={s.infoCard}>
                <div className="mb-2">
                  <p className={s.infoLabel}>Full Legal Name:</p>
                  <p className="font-bold text-white text-sm">{purchase.user.name}</p>
                </div>
                <div className="mb-2">
                  <p className={s.infoLabel}>Email:</p>
                  <p className={s.infoValue}>{purchase.user.email}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Contact Phone:</p>
                  <p className={s.infoValue}>{purchase.user.phone}</p>
                </div>
              </div>

              <h3 className="text-base font-bold flex items-center gap-2 mt-4 text-cyan-300">
                <FaCreditCard className="text-cyan-400" /> Payment Verification
              </h3>
              <div className={s.infoCard}>
                <div className="mb-2">
                  <p className={s.infoLabel}>Payment Status:</p>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    PAID (Verified)
                  </span>
                </div>
                <div className="mb-2">
                  <p className={s.infoLabel}>Payment Method:</p>
                  <p className={s.infoValue}>{purchase.paymentMethod}</p>
                </div>
                <div>
                  <p className={s.infoLabel}>Transaction Reference:</p>
                  <p className="font-mono text-xs text-cyan-300 break-all">
                    {purchase.paymentId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Payment Breakdown
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Vehicle Ex-Showroom Unit Price:</span>
                <span className="font-mono text-white">{formatPrice(purchase.car.unitPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Quantity:</span>
                <span className="font-mono text-white">{purchase.quantity} Unit(s)</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Doorstep Transport & Pre-Delivery Inspection:</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-white">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-cyan-400 text-base">{formatPrice(purchase.price)}</span>
              </div>
            </div>
          </div>

          <div className={s.modalActions}>
            <button type="button" onClick={onClose} className={s.closeButton}>
              Close
            </button>
            <Link to="/cars" onClick={onClose} className={s.modalBookButton}>
              Explore More Cars <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Purchases component and summary statistics
const StatsCard = ({ value, label, color, icon }) => (
  <div className={s.statsCard}>
    <div className="flex items-center justify-between">
      <div className={s.statsValue(color)}>{value}</div>
      {icon && <div className="text-2xl opacity-40 text-gray-400">{icon}</div>}
    </div>
    <p className={s.statsLabel}>{label}</p>
  </div>
);

const MyBookings = () => {
  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => () => (isMounted.current = false), []);

  /**
   * Fetches the logged-in customer's purchase history using their JWT token.
   * Runs the normalizeBooking helper to shape each order object for rendering.
   */
  const fetchPurchases = useCallback(async () => {
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      let response = null;
      try {
        response = await axios.get(`${API_BASE}/api/bookings/my-purchases`, {
          headers,
          signal: controller.signal,
        });
      } catch {
        response = await axios.get(`${API_BASE}/api/bookings/mybooking`, {
          headers,
          signal: controller.signal,
        });
      }

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
        response.data?.purchases ||
        response.data?.bookings ||
        response.data?.rows ||
        [];

      const normalized = (Array.isArray(rawData) ? rawData : []).map(
        normalizeBooking
      );

      if (!isMounted.current) return;
      setPurchases(normalized);
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      if (err?.name === "CanceledError" || err?.message === "canceled") {
        setError("Request timed out");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load purchase history"
        );
      }
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = useMemo(
    () =>
      filter === "all"
        ? purchases
        : purchases.filter((p) => p.status === filter),
    [purchases, filter]
  );

  const filterButtons = [
    { key: "all", label: "All Purchases", icon: <FaFilter /> },
    { key: "confirmed", label: "Confirmed Orders", icon: <FaCheckCircle /> },
    { key: "pending", label: "Processing", icon: <FaClock /> },
  ];

  const openDetails = (p) => {
    setSelectedPurchase(p);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedPurchase(null);
    setShowModal(false);
  };

  const totalVehiclesCount = useMemo(
    () => purchases.reduce((sum, p) => sum + (p.quantity || 1), 0),
    [purchases]
  );

  const totalInvestedAmount = useMemo(
    () => purchases.reduce((sum, p) => sum + (Number(p.price) || 0), 0),
    [purchases]
  );

  const confirmedPurchasesCount = useMemo(
    () => purchases.filter((p) => p.status === "confirmed").length,
    [purchases]
  );

  return (
    <div className={s.pageContainer}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <FaShieldAlt className="text-xs" /> Official Dealership Purchase Records
          </div>
          <h1 className={s.title}>My Purchases</h1>
          <p className={s.subtitle}>
            Track your purchased vehicles, view delivery addresses, inspect complete specifications, and print official tax invoices.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filterButtons.map((btn) => (
            <FilterButton
              key={btn.key}
              filterKey={btn.key}
              currentFilter={filter}
              icon={btn.icon}
              label={btn.label}
              onClick={setFilter}
            />
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className={s.loadingSpinner} />
          </div>
        )}

        {!loading && error && (
          <div className={s.errorContainer}>
            <p className={s.errorText}>{error}</p>
            <button
              type="button"
              onClick={fetchPurchases}
              className={s.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredPurchases.length === 0 && (
          <div className={s.emptyState}>
            <div className={s.emptyIconContainer}>
              <FaCar className={s.emptyIcon} />
            </div>
            <h3 className={s.emptyTitle}>No purchases found</h3>
            <p className={s.emptyText}>
              {filter === "all"
                ? "You haven't purchased any vehicles yet. Explore our premium showroom collection to get started!"
                : `You don't have any ${filter} purchases.`}
            </p>
            <Link to="/cars" className={s.browseButton}>
              <FaCar /> Browse Available Cars
            </Link>
          </div>
        )}

        {!loading && !error && filteredPurchases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onViewDetails={openDetails}
              />
            ))}
          </div>
        )}

        {/* Top-Level Purchase Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            value={totalVehiclesCount}
            label="Total Vehicles Owned"
            color="text-cyan-400"
            icon={<FaCar />}
          />
          <StatsCard
            value={formatPrice(totalInvestedAmount)}
            label="Total Portfolio Value (₹)"
            color="text-emerald-400"
            icon={<FaBox />}
          />
          <StatsCard
            value={confirmedPurchasesCount}
            label="Confirmed Orders"
            color="text-blue-400"
            icon={<FaCheckCircle />}
          />
        </div>
      </div>

      {showModal && selectedPurchase && (
        <PurchaseInvoiceModal
          purchase={selectedPurchase}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MyBookings;