// frontend/src/admin/ManageCar.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { styles } from "./adminStyles";
import axios from "axios";
import {
  FaCar,
  FaEdit,
  FaGasPump,
  FaTachometerAlt,
  FaTrash,
  FaTimes,
  FaBoxes,
  FaPlusCircle,
  FaUser,
  FaCog,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { getRealisticRupeePrice } from "../components/CarDetail";
import { API_BASE } from "../config/api";

const BASE = API_BASE;
const api = axios.create({
  baseURL: BASE,
  headers: { Accept: "application/json" },
});

const makeImageUrl = (img) => {
  if (!img) return "";
  const s = String(img).trim();
  return /^https?:\/\//i.test(s)
    ? s
    : `${BASE}/uploads/${s.replace(/^\/+/, "").replace(/^uploads\//, "")}`;
};

const sanitizeImageForBackend = (img) => {
  if (!img) return "";
  let s = String(img).trim();
  if (/^https?:\/\//i.test(s)) {
    const idx = s.lastIndexOf("/uploads/");
    s =
      idx !== -1
        ? s.slice(idx + "/uploads/".length)
        : s.slice(s.lastIndexOf("/") + 1);
  }
  return s.replace(/^\/+/, "").replace(/^uploads\//, "");
};

const buildSafeCar = (raw = {}, idx = 0) => {
  const _id = raw._id || raw.id || null;
  const dailyRate = raw.dailyRate ?? 50;
  const price = raw.price !== undefined && raw.price !== null ? raw.price : dailyRate * 500;
  const quantity = raw.quantity !== undefined && raw.quantity !== null ? raw.quantity : 5;

  return {
    _id,
    id: _id || raw.id || raw.localId || `local-${idx + 1}`,
    make: raw.make || "",
    model: raw.model || "",
    year: raw.year ?? "",
    category: raw.category || "Sedan",
    seats: raw.seats ?? 4,
    transmission: raw.transmission || "Automatic",
    fuelType: raw.fuelType || raw.fuel || "Gasoline",
    mileage: raw.mileage ?? 0,
    price,
    dailyRate,
    quantity,
    status: raw.status || "available",
    _rawImage: raw.image ?? raw._rawImage ?? "",
    image: raw.image
      ? makeImageUrl(raw.image)
      : raw._rawImage
        ? makeImageUrl(raw._rawImage)
        : "",
  };
};

const StatCard = ({ title, value, icon: Icon, className = "" }) => {
  return (
    <div
      className={`${styles.gradientOrange} ${styles.rounded2xl} ${styles.statCard} ${styles.borderGray} ${styles.borderHoverOrange} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`${styles.textGray} text-sm font-medium mb-2`}>
            {title}
          </h3>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-800/30">
          {Icon ? <Icon className={`${styles.textOrange} text-xl`} /> : null}
        </div>
      </div>
    </div>
  );
};

const CarCard = ({ car, onEdit, onDelete, onRestock }) => {
  const isOutOfStock = car.quantity <= 0;

  return (
    <div
      className={`${styles.gradientGray} ${styles.rounded2xl} ${styles.carCard} ${styles.borderGray} ${styles.borderHoverOrange}`}
    >
      <div className="relative">
        <img
          src={car.image}
          alt={`${car.make} ${car.model}`}
          className={styles.carImage}
        />
        {/* Stock Status Badge */}
        <div className="absolute top-4 right-4">
          {isOutOfStock ? (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-950/90 text-red-400 border border-red-600/50 shadow-md">
              Out of Stock
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 shadow-md">
              In Stock: {car.quantity}
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              {car.make} {car.model}
            </h3>
            <p className={styles.textGray}>{car.category} • {car.year}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">
              ₹{getRealisticRupeePrice(car.make, car.model, Number(car.price || car.dailyRate * 500)).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-500">Ex-Showroom Price</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex items-center text-sm">
            <FaGasPump className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.fuelType}</span>
          </div>

          <div className="flex items-center text-sm">
            <FaBoxes className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.quantity} Available</span>
          </div>

          <div className="flex items-center text-sm">
            <FaUser className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.seats} seats</span>
          </div>

          <div className="flex items-center text-sm">
            <FaCog className={`${styles.textOrange} mr-2`} />
            <span className={styles.textGray300}>{car.transmission}</span>
          </div>
        </div>

        {/* Action Buttons: Restock, Edit, Delete */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-4 gap-2">
          <button
            onClick={() => onRestock(car)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/60 border border-cyan-800/50 transition-all cursor-pointer"
            title="Restock Vehicle Quantity"
          >
            <FaPlusCircle className="text-xs" /> Restock
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(car)}
              className={`flex items-center text-sm ${styles.textOrange} hover:text-cyan-300 transition-colors cursor-pointer`}
            >
              <FaEdit className="mr-1" /> Edit
            </button>

            <button
              onClick={() => onDelete(car._id || car.id)}
              className={`flex items-center text-sm ${styles.textRed} hover:text-red-300 transition-colors cursor-pointer`}
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ car, onClose, onSubmit, onChange }) => {
  const mapToBackend = (c) => ({
    make: c.make,
    model: c.model,
    year: Number(c.year || 0),
    category: c.category || "Sedan",
    seats: Number(c.seats || 0),
    transmission: c.transmission || "Automatic",
    fuelType: c.fuelType,
    mileage: Number(c.mileage || 0),
    price: Number(c.price || 25000),
    dailyRate: Number(c.dailyRate || Math.round((c.price || 25000) / 500)),
    quantity: Number(c.quantity !== undefined ? c.quantity : 5),
    status: c.status || "available",
    image: sanitizeImageForBackend(c.image || c._rawImage || ""),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!car?.make || !car?.model)
      return toast.error("Make and Model required");
    onSubmit(mapToBackend(car));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...car,
      [name]: ["year", "dailyRate", "mileage", "seats", "price", "quantity"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    });
  };

  const inputField = (label, name, type = "text", options = {}) => (
    <div>
      <label className={`block ${styles.textGray} text-sm mb-1`}>{label}</label>
      {type === "select" ? (
        <select
          name={name}
          value={car[name] || ""}
          onChange={handleInputChange}
          className={styles.inputField}
          required={options.required}
        >
          {options.items?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={car[name] !== undefined ? car[name] : ""}
          onChange={handleInputChange}
          className={styles.inputField}
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.step}
        />
      )}
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.gradientGrayToGray} ${styles.rounded2xl} ${styles.modalContainer} ${styles.borderOrange}`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center border-b border-cyan-800/30 pb-4">
            <h2 className="text-2xl font-bold text-white">
              {car._id ? `Edit: ${car.make} ${car.model}` : "Add New Vehicle"}
            </h2>
            <button onClick={onClose} className={styles.textGray}>
              <FaTimes className="h-6 w-6 cursor-pointer hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inputField("Make", "make", "text", { required: true })}
              {inputField("Model", "model", "text", { required: true })}
              {inputField("Year", "year", "number", {
                required: true,
                min: 1900,
                max: 2099,
              })}
              {inputField("Category", "category", "select", {
                required: true,
                items: [
                  "Sedan",
                  "SUV",
                  "Sports",
                  "Coupe",
                  "Hatchback",
                  "Luxury",
                ],
              })}
              {inputField("Retail Price ($)", "price", "number", {
                required: true,
                min: 1,
              })}
              {inputField("Quantity in Stock", "quantity", "number", {
                required: true,
                min: 0,
              })}
              {inputField("Status", "status", "select", {
                required: true,
                items: ["available", "sold_out", "maintenance"],
              })}
              {inputField("Transmission", "transmission", "select", {
                required: true,
                items: ["Automatic", "Manual", "CVT"],
              })}
              {inputField("Fuel Type", "fuelType", "select", {
                required: true,
                items: ["Gasoline", "Diesel", "Hybrid", "Electric"],
              })}
              {inputField("Mileage", "mileage", "number", {
                required: true,
                min: 0,
              })}
            </div>

            {inputField("Image (filename or URL)", "image", "text", {
              required: false,
            })}

            {car.image && (
              <div className="flex justify-center">
                <img
                  src={makeImageUrl(car.image)}
                  alt="preview"
                  className="h-36 object-contain rounded-md border border-cyan-800/30"
                />
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`${styles.buttonSecondary} cursor-pointer`}
              >
                Cancel
              </button>
              <button type="submit" className={`${styles.buttonPrimary} cursor-pointer`}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RestockModal = ({ car, onClose, onConfirm }) => {
  const [qty, setQty] = useState(5);

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.gradientGrayToGray} ${styles.rounded2xl} max-w-md w-full p-6 border border-cyan-500/40 shadow-2xl`}>
        <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaBoxes className="text-cyan-400" /> Restock Vehicle
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          Add inventory units for <strong className="text-white">{car.make} {car.model}</strong>.
        </p>

        <div className="p-3 bg-gray-900/60 rounded-xl mb-4 text-xs text-gray-400 flex justify-between">
          <span>Current Stock: <strong className="text-cyan-300">{car.quantity} units</strong></span>
          <span>New Stock: <strong className="text-emerald-300">{car.quantity + Number(qty || 0)} units</strong></span>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Units to Add
          </label>
          <div className="flex items-center gap-2">
            {[1, 5, 10, 20].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQty(count)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${qty === count
                    ? "bg-cyan-600 text-white border-cyan-500"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                  }`}
              >
                +{count}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-full mt-3 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`${styles.buttonSecondary} text-sm cursor-pointer`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(car, qty)}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md cursor-pointer"
          >
            Confirm Restock (+{qty})
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageCar = () => {
  const [cars, setCars] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingCar, setEditingCar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [restockingCar, setRestockingCar] = useState(null);

  const fetchCars = useCallback(async () => {
    try {
      const res = await api.get("/api/vehicles?limit=100");
      const raw = Array.isArray(res.data) ? res.data : (res.data.data || res.data.vehicles || []);
      setCars(
        raw.map((c, i) => ({
          ...buildSafeCar(c, i),
          image: c.image ? makeImageUrl(c.image) : buildSafeCar(c, i).image,
          _rawImage: c.image ?? c._rawImage ?? "",
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load inventory");
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(new Set(cars.map((c) => c.category || "Sedan"))),
    ],
    [cars]
  );

  const filteredCars = useMemo(
    () =>
      cars.filter(
        (car) => categoryFilter === "all" || car.category === categoryFilter
      ),
    [cars, categoryFilter]
  );

  const totalStockUnits = useMemo(() => {
    return cars.reduce((acc, c) => acc + (c.quantity || 0), 0);
  }, [cars]);

  /**
   * Prompts the admin for confirmation, then calls the backend DELETE route
   * with the admin bearer token to remove the vehicle from the database.
   */
  const handleDelete = async (identifier) => {
    const car = cars.find((c) => c._id === identifier || c.id === identifier);
    if (!car) return toast.error("Vehicle not found");
    if (!window.confirm(`Are you sure you want to delete ${car.make} ${car.model}?`)) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      await api.delete(`/api/vehicles/${car._id || car.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      toast.success("Vehicle deleted from inventory");
      fetchCars();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const openEdit = (car) => {
    setEditingCar({
      ...car,
      image: car._rawImage ?? car.image ?? "",
      _id: car._id ?? null,
    });
    setShowEditModal(true);
  };

  /**
   * Submits the vehicle edit form.
   * If updating an existing car, sends a PUT request.
   * If creating a new one, sends a POST request.
   */
  const handleEditSubmit = async (payload) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${adminToken}` };

      if (!editingCar._id) {
        await api.post("/api/vehicles", payload, { headers });
        toast.success("Vehicle added to inventory");
      } else {
        await api.put(`/api/vehicles/${editingCar._id}`, payload, { headers });
        toast.success("Vehicle updated successfully");
      }
      setShowEditModal(false);
      setEditingCar(null);
      fetchCars();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update vehicle");
    }
  };

  /**
   * Calls the restock endpoint to add the specified quantity to a vehicle's inventory.
   * Refreshes the list so the new stock count immediately shows up in the UI.
   */
  const handleRestockConfirm = async (car, qty) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await api.post(
        `/api/vehicles/${car._id || car.id}/restock`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      toast.success(res.data.message || `Restocked ${qty} units successfully!`);
      setRestockingCar(null);
      fetchCars();
    } catch (err) {
      console.error("Restock error:", err);
      toast.error(err.response?.data?.message || "Failed to restock vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="relative mb-8 pt-16 text-center">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <div className="h-1 w-20 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
        </div>
        <h1 className="text-4xl font-extrabold py-4 text-white sm:text-5xl mb-3 tracking-wide">
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
            Dealership Fleet &amp; Inventory Management
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Manage dealership stock, add new models, adjust pricing, and restock inventory in real time
        </p>
      </div>

      {/* Stats & Category Filter */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <StatCard title="Total Models" value={cars.length} icon={FaCar} />
            <StatCard title="Total Stock Units" value={totalStockUnits} icon={FaBoxes} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-400">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-800/80 border border-gray-700 px-4 py-2.5 text-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 capitalize text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onEdit={openEdit}
            onDelete={handleDelete}
            onRestock={setRestockingCar}
          />
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-16 bg-gray-900/40 rounded-2xl border border-gray-800 mt-6">
          <FaCar className="mx-auto text-4xl text-gray-600 mb-3" />
          <h3 className="text-xl font-bold text-white">No Vehicles Found</h3>
          <p className="text-gray-400 text-sm mt-1">Try resetting category filters.</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCar && (
        <EditModal
          car={editingCar}
          onClose={() => {
            setShowEditModal(false);
            setEditingCar(null);
          }}
          onSubmit={handleEditSubmit}
          onChange={setEditingCar}
        />
      )}

      {/* Restock Modal */}
      {restockingCar && (
        <RestockModal
          car={restockingCar}
          onClose={() => setRestockingCar(null)}
          onConfirm={handleRestockConfirm}
        />
      )}
    </div>
  );
};

export default ManageCar;
