import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaGasPump,
  FaShoppingCart,
  FaTachometerAlt,
  FaUserFriends,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { carPageStyles } from "../assets/dummyStyles";
import { getRealisticRupeePrice } from "./CarDetail";
import { API_BASE, buildImageSrc as sharedBuildImageSrc } from "../config/api";

const Cars = () => {
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const abortControllerRef = useRef(null);
  const limit = 50;
  const fallbackImage = `${API_BASE}/uploads/default-car.png`;

  useEffect(() => {
    fetchCars();
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) { }
      }
    };
  }, []);

  /**
   * Fetches the complete showroom fleet from the backend API.
   * Uses an AbortController so fast page navigations cancel stale network requests.
   */
  const fetchCars = async () => {
    setLoading(true);
    setError("");
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) { }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await axios.get(`${API_BASE}/api/vehicles`, {
        params: { limit },
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      const json = res.data;
      const list = Array.isArray(json.data) ? json.data : (json.vehicles || []);
      setCars(list);
    } catch (err) {
      if (axios.isCancel(err) || err?.name === "CanceledError") return;
      console.error("Failed to fetch vehicles:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(["all"]);
    cars.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [cars]);

  /**
   * Evaluates all active filters on the client side:
   * 1. Search text matching make, model, or category.
   * 2. Category dropdown selection.
   * 3. Min / max price range checks.
   * 4. In-stock toggle (filters out cars with 0 quantity).
   */
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const q = searchTerm.toLowerCase().trim();
      const carName = `${car.make || ""} ${car.model || ""}`.toLowerCase();
      const matchesSearch = !q || carName.includes(q) || (car.category && car.category.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === "all" || (car.category && car.category.toLowerCase() === selectedCategory.toLowerCase());

      const rawPrice = car.price !== undefined ? Number(car.price) : (car.dailyRate ? car.dailyRate * 500 : 25000);
      const carPrice = getRealisticRupeePrice(car.make, car.model, rawPrice);
      const matchesMin = minPrice === "" || carPrice >= Number(minPrice);
      const matchesMax = maxPrice === "" || carPrice <= Number(maxPrice);

      const qty = car.quantity !== undefined ? car.quantity : 5;
      const matchesStock = !inStockOnly || qty > 0;

      return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesStock;
    });
  }, [cars, searchTerm, selectedCategory, minPrice, maxPrice, inStockOnly]);

  const buildImageSrc = (image) => {
    if (!image) return "";
    if (Array.isArray(image)) image = image[0];
    if (typeof image !== "string") return "";
    return sharedBuildImageSrc(image);
  };

  const handleImageError = (e) => {
    const img = e?.target;
    if (!img) return;
    img.onerror = null;
    img.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
  };

  // Navigate to vehicle details & Stripe booking
  const handlePurchaseClick = (car) => {
    const rawPrice = car.price !== undefined ? Number(car.price) : (car.dailyRate ? car.dailyRate * 500 : 25000);
    const realisticPrice = getRealisticRupeePrice(car.make, car.model, rawPrice);
    const enrichedCar = { ...car, price: realisticPrice };
    const qty = car.quantity !== undefined ? car.quantity : 5;
    if (qty <= 0) {
      toast.error("This vehicle is currently out of stock!", { theme: "colored" });
      return;
    }
    const id = car._id || car.id;
    navigate(`/cars/${id}`, { state: { car: enrichedCar } });
  };

  return (
    <div className={carPageStyles.pageContainer}>
      <div className={carPageStyles.contentContainer}>
        {/* Page Header */}
        <div className={carPageStyles.headerContainer}>
          <div className={carPageStyles.headerDecoration}></div>
          <h1 className={carPageStyles.title}>Dealership Vehicle Inventory</h1>
          <p className={carPageStyles.subtitle}>
            Explore our curated inventory of vehicles ready for purchase. Real-time stock counts and instant ownership transfer.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-5 mb-8 border border-gray-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Search Vehicle
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-3.5 text-cyan-400 text-sm" />
                <input
                  type="text"
                  placeholder="Make or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <FaFilter className="absolute left-3.5 top-3.5 text-cyan-400 text-sm" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* In-Stock Filter & Reset */}
            <div className="flex items-end justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer pb-2.5 text-sm text-gray-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-gray-800 border-gray-700"
                />
                <span>In Stock Only</span>
              </label>

              {(searchTerm || selectedCategory !== "all" || minPrice || maxPrice || inStockOnly) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setInStockOnly(false);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-950/50 transition-all cursor-pointer flex items-center gap-1.5 mb-1"
                >
                  <FaTimes className="text-xs" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className={carPageStyles.gridContainer}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className={carPageStyles.carCard}>
                <div className="w-full h-48 bg-gray-800 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse" />
                  <div className="h-10 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full text-center text-red-400 p-8 bg-red-950/20 rounded-2xl border border-red-800/40">
              {error}
            </div>
          )}

          {!loading && !error && filteredCars.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800">
              <FaCar className="mx-auto text-4xl text-gray-600 mb-3" />
              <h3 className="text-xl font-bold text-white">No Vehicles Match Your Search</h3>
              <p className="text-gray-400 text-sm mt-1">Try clearing filters or adjusting your price range.</p>
            </div>
          )}

          {!loading &&
            filteredCars.map((car, idx) => {
              const id = car._id ?? car.id ?? idx;
              const carName = `${car.make || ""} ${car.model || ""}`.trim() || "Dealership Vehicle";
              const imageSrc = buildImageSrc(car.image) || fallbackImage;
              const rawPrice = car.price !== undefined ? Number(car.price) : (car.dailyRate ? car.dailyRate * 500 : 25000);
              const price = getRealisticRupeePrice(car.make, car.model, rawPrice);
              const quantity = car.quantity !== undefined ? Number(car.quantity) : 5;
              const isOutOfStock = quantity <= 0;

              return (
                <div
                  key={id}
                  onClick={() => !isOutOfStock && handlePurchaseClick(car)}
                  className={`${carPageStyles.carCard} ${isOutOfStock ? "" : "cursor-pointer hover:border-cyan-500/50"}`}
                >
                  <div className={carPageStyles.glowEffect}></div>

                  <div className={carPageStyles.imageContainer}>
                    <img
                      src={imageSrc}
                      alt={carName}
                      onError={handleImageError}
                      className={carPageStyles.carImage}
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute right-3 top-3 z-20">
                      {isOutOfStock ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-950/90 text-red-400 border border-red-600/50 shadow-md">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 shadow-md flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          In Stock: {quantity}
                        </span>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className={carPageStyles.priceBadge}>
                      ₹{price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className={carPageStyles.cardContent}>
                    <div className={carPageStyles.headerRow}>
                      <div>
                        <h3 className={carPageStyles.carName}>{carName}</h3>
                        <p className={carPageStyles.carType}>
                          {car.category || "Sedan"} • {car.year || "2024"}
                        </p>
                      </div>
                    </div>

                    <div className={carPageStyles.specsGrid}>
                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaUserFriends className="text-sky-400" />
                        </div>
                        <span>{car.seats ?? "5"} Seats</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaGasPump className="text-amber-400" />
                        </div>
                        <span>{car.fuelType || "Gasoline"}</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaTachometerAlt className="text-emerald-400" />
                        </div>
                        <span>{car.transmission || "Automatic"}</span>
                      </div>

                      <div className={carPageStyles.specItem}>
                        <div className={carPageStyles.specIconContainer}>
                          <FaShieldAlt className="text-purple-400" />
                        </div>
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Purchase Button - Disabled if quantity === 0 per Kata requirement */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchaseClick(car);
                      }}
                      disabled={isOutOfStock}
                      className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${isOutOfStock
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        }`}
                      aria-label={isOutOfStock ? `${carName} is out of stock` : `Purchase ${carName}`}
                      title={isOutOfStock ? "Out of Stock - Purchase is disabled" : `Purchase for ₹${price.toLocaleString("en-IN")}`}
                    >
                      <FaShoppingCart className="text-sm" />
                      <span>{isOutOfStock ? "OUT OF STOCK" : "PURCHASE VEHICLE"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
  );
};

export default Cars;