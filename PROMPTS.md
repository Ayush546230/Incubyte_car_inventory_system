# Raw AI Chat Logs & Public Links (PROMPTS.md)

Repository: https://github.com/Ayush546230/Incubyte_car_inventory_system
Assessment: Incubyte Full-Stack Software Craftsperson Assessment (TDD Kata)
Candidate: Ayush Srivastava

Official Public AI Chat Links:
- Google Gemini: https://share.gemini.google/CqPqsKV3t2on
- ChatGPT (GPT-4o): https://chatgpt.com/share/6adcf037-143c-83ee-a0d1-9a09a5e969fe

---

Let's start bootstrapping our backend server in `backend/server.js`. I want a clean Express 5 setup with json parsing, CORS enabled for local development, Morgan logging, and serving our `/uploads` folder statically for car images. Can you write the basic server bootstrap?

Here is the clean setup for `backend/server.js`:

```javascript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static image serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "online", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB();
  app.listen(PORT, () => {
    console.log(`RYDEX Server running on port ${PORT}`);
  });
}

export default app;
```

---

Now let's create our database connection helper in `backend/config/db.js`. On Windows, Node's DNS resolver often has trouble resolving MongoDB Atlas `mongodb+srv://` URLs. How can we make the connection robust so it doesn't fail on local Windows setups?

We can instruct Node's `dns` module to use public DNS resolvers (Cloudflare `1.1.1.1` and Google `8.8.8.8`) to prevent `querySrv ECONNREFUSED` errors, and add a fallback URI.

Here is `backend/config/db.js`:

```javascript
import mongoose from "mongoose";
import dns from "dns";

// Fix Windows SRV DNS resolution failure
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      family: 4,
    });
    console.log("MongoDB Atlas Connected successfully via Primary SRV");
  } catch (err) {
    console.warn("Primary SRV connection failed, attempting fallback:", err.message);
    if (process.env.MONGO_FALLBACK_URI) {
      await mongoose.connect(process.env.MONGO_FALLBACK_URI, {
        serverSelectionTimeoutMS: 8000,
        family: 4,
      });
      console.log("MongoDB Atlas Connected via Fallback URI");
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
```

---

Great. Now let's define the `Car` inventory model in `backend/models/carModal.js`. Each vehicle needs to have make, model, category (Sedan, SUV, Luxury, Electric), price, quantity (stock count), transmission, fuelType, image, and status ('available' or 'sold_out'). Write the Mongoose schema.

Here is the schema for `backend/models/carModal.js`:

```javascript
import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Sedan", "SUV", "Luxury", "Electric", "Standard"],
      default: "Standard",
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 1, min: 0 },
    transmission: { type: String, enum: ["Automatic", "Manual"], default: "Automatic" },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid"], default: "Petrol" },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "sold_out"],
      default: "available",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);
```

---

Now let's build the User model in `backend/models/userModel.js`. We need customer registration with email, password, name, phone, and role ('user' | 'admin'). Also write a pre-save hook using bcrypt to hash the password before saving.

Here is `backend/models/userModel.js`:

```javascript
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
```

---

Now let's write our authentication middleware in `backend/middlewares/auth.js`. We need two functions:
1. `verifyToken`: extracts the Bearer token from the Authorization header, verifies it with JWT_SECRET, and attaches `req.user`.
2. `adminOnly`: checks if `req.user.role === 'admin'`, and returns 403 Forbidden if not.

Here is `backend/middlewares/auth.js`:

```javascript
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rydex_jwt_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access forbidden. Admin role required." });
  }
  next();
};
```

---

We also need image upload support for admin adding cars. Let's configure Multer in `backend/middlewares/uploads.js`. Store files in `backend/uploads/` with a unique timestamp filename and allow only png, jpg, jpeg, and webp.

Here is `backend/middlewares/uploads.js`:

```javascript
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "car-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only image files (.jpg, .jpeg, .png, .webp) are allowed!"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});
```

---

Now let's write the `createVehicle` controller in `backend/controllers/vehicleController.js`. It should parse make, model, category, price, quantity from `req.body`. If an image file was uploaded via Multer, use its path. Ensure quantity and price are numbers, and set status to 'available' or 'sold_out'.

Here is the `createVehicle` implementation:

```javascript
import Car from "../models/carModal.js";

export const createVehicle = async (req, res) => {
  try {
    const { make, model, category, price, quantity, transmission, fuelType, description } = req.body;

    if (!make || !model) {
      return res.status(400).json({ success: false, message: "Make and Model are required." });
    }

    const numQuantity = Number(quantity) || 1;
    const numPrice = Number(price) || 0;
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : req.body.image || "";

    const car = new Car({
      make,
      model,
      category: category || "Standard",
      price: numPrice,
      quantity: numQuantity,
      transmission: transmission || "Automatic",
      fuelType: fuelType || "Petrol",
      image: imagePath,
      description: description || "",
      status: numQuantity > 0 ? "available" : "sold_out",
    });

    await car.save();
    return res.status(201).json({ success: true, message: "Vehicle added successfully", car });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's write the `getAllVehicles` controller with pagination so we can paginate inventory on the frontend. Return the total count, current page, total pages, and the cars array.

Here is `getAllVehicles` in `backend/controllers/vehicleController.js`:

```javascript
export const getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await Car.countDocuments();
    const cars = await Car.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      cars,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now for the search endpoint: `searchVehicles` at `GET /api/vehicles/search`. Customers want to search by `make` (case-insensitive substring), filter by `category`, and specify `minPrice` and `maxPrice`. Write the query builder logic.

Here is `searchVehicles`:

```javascript
export const searchVehicles = async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice, inStockOnly } = req.query;
    let query = {};

    if (make) {
      query.make = { $regex: make, $options: "i" };
    }
    if (model) {
      query.model = { $regex: model, $options: "i" };
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (inStockOnly === "true") {
      query.quantity = { $gt: 0 };
    }

    const cars = await Car.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: cars.length, cars });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Let's add the single vehicle lookup `getVehicleById` at `GET /api/vehicles/:id`. Return 404 if not found.

Here is `getVehicleById`:

```javascript
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    return res.status(200).json({ success: true, car });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's write the `updateVehicle` endpoint (`PUT /api/vehicles/:id`). Admins can update price, quantity, category, specs, or upload a new image. If quantity is updated to 0, status must become 'sold_out'; if greater than 0, status must be 'available'.

Here is `updateVehicle`:

```javascript
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    if (updateData.quantity !== undefined) {
      updateData.quantity = Number(updateData.quantity);
      updateData.status = updateData.quantity > 0 ? "available" : "sold_out";
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    const car = await Car.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!car) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    return res.status(200).json({ success: true, message: "Vehicle updated successfully", car });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's write `deleteVehicle` at `DELETE /api/vehicles/:id`. Only admins can delete. If the vehicle had an image stored in `uploads/`, delete that physical file from disk using `fs.unlinkSync` to avoid orphaned files.

Here is `deleteVehicle`:

```javascript
import fs from "fs";

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    // Clean up local image asset if stored in uploads/
    if (car.image && car.image.startsWith("uploads/")) {
      if (fs.existsSync(car.image)) {
        try {
          fs.unlinkSync(car.image);
        } catch (unlinkErr) {
          console.warn("Could not delete image file:", unlinkErr.message);
        }
      }
    }

    await Car.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Vehicle deleted and assets cleaned up successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's create the Booking/Purchase model in `backend/models/bookingModal.js`. When a customer purchases a vehicle, we record: user reference, car reference, purchase price, customer delivery address, contact phone, and order status ('pending', 'confirmed', 'completed').

Here is `backend/models/bookingModal.js`:

```javascript
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "confirmed",
    },
    paymentMethod: { type: String, default: "Cash on Delivery" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
```

---

Now for the core TDD Kata requirement: `purchaseVehicle` at `POST /api/vehicles/:id/purchase`.
When a customer purchases a car:
1. Verify the car exists and has stock (`quantity > 0`). If not, return 400 "Out of stock".
2. If requested quantity exceeds stock, return 400 "Insufficient stock".
3. Decrement the car's quantity by the purchased amount.
4. If quantity hits 0, update status to 'sold_out'.
5. Create a `Booking` record to track the purchase.
Write this controller function.

Here is the `purchaseVehicle` implementation:

```javascript
import Booking from "../models/bookingModal.js";

export const purchaseVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseQty = Number(req.body.quantity) || 1;
    const { name, phone, address, paymentMethod } = req.body;

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    if (car.quantity <= 0) {
      return res.status(400).json({ success: false, message: "Out of stock: Vehicle is sold out." });
    }

    if (purchaseQty > car.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock: Requested ${purchaseQty}, only ${car.quantity} units available.`,
      });
    }

    // Atomically decrement stock
    car.quantity -= purchaseQty;
    if (car.quantity === 0) {
      car.status = "sold_out";
    }
    await car.save();

    // Create purchase order record
    const booking = new Booking({
      user: req.user.id,
      car: car._id,
      customerName: name || req.user.name || "Customer",
      customerPhone: phone || "Not Provided",
      deliveryAddress: address || "Showroom Handover Delivery",
      totalAmount: car.price * purchaseQty,
      paymentMethod: paymentMethod || "Standard Checkout",
      status: "confirmed",
    });
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle purchase completed successfully.",
      car,
      booking,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's write `restockVehicle` at `POST /api/vehicles/:id/restock`. Only admins can call this. Validate that `quantity` is a positive number, increment the car's quantity, set status back to 'available', and save.

Here is `restockVehicle`:

```javascript
export const restockVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const restockQty = Number(req.body.quantity);

    if (!restockQty || restockQty <= 0) {
      return res.status(400).json({ success: false, message: "A valid positive restock quantity is required." });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Vehicle not found." });
    }

    car.quantity += restockQty;
    car.status = "available";
    await car.save();

    return res.status(200).json({
      success: true,
      message: `Inventory restocked successfully. Current quantity: ${car.quantity}`,
      car,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now write the endpoint for customers to view their order history: `getMyPurchases` at `GET /api/bookings/my-purchases`. Populate the `car` details so the frontend can display vehicle thumbnails and specs.

Here is `getMyPurchases` in `backend/controllers/bookingController.js`:

```javascript
import Booking from "../models/bookingModal.js";

export const getMyPurchases = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("car")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

Now let's switch to the frontend. I noticed `http://localhost:5000` is repeated in multiple components. Can you build `frontend/src/config/api.js` to centralize our API host and export a `normalizeImageUrl` helper for uploaded photos?

Here is `frontend/src/config/api.js`:

```javascript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://incubyte-car-inventory-system.onrender.com"
    : "http://localhost:5000");

export const normalizeImageUrl = (imagePath) => {
  if (!imagePath) return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${API_BASE_URL}/${cleanPath}`;
};
```

---

Now let's build the luxury showroom catalog in `frontend/src/components/Cars.jsx`. It needs:
- Dark zinc palette with gold accents
- Instant search bar and category filter pills (All, Sedan, SUV, Luxury, Electric)
- Vehicle cards showing photo, price formatted in INR, and a stock badge:
  - If `quantity > 0`: Emerald badge "In Stock: X Units"
  - If `quantity === 0`: Pulsing red badge "OUT OF STOCK"
- If a car is out of stock, the button should be disabled and say "Unavailable".

Here is `frontend/src/components/Cars.jsx`:

```jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL, normalizeImageUrl } from "../config/api.js";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append("make", search);
    if (category !== "all") params.append("category", category);

    fetch(`${API_BASE_URL}/api/vehicles/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setCars(data.cars || []))
      .catch((err) => console.error(err));
  }, [search, category]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Search make or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white w-full md:w-80"
        />
        <div className="flex gap-2 flex-wrap">
          {["all", "Sedan", "SUV", "Luxury", "Electric"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                category === cat ? "bg-amber-500 text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}
            >
              {cat === "all" ? "All Models" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => {
          const isOut = Number(car.quantity) === 0;
          return (
            <div key={car._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="relative">
                <img src={normalizeImageUrl(car.image)} alt={car.make} className={`w-full h-52 object-cover ${isOut ? "grayscale opacity-50" : ""}`} />
                <div className="absolute top-3 right-3">
                  {isOut ? (
                    <span className="bg-red-950/80 text-red-400 text-xs px-2.5 py-1 rounded-full font-bold border border-red-800 animate-pulse flex items-center gap-1">
                      <FaExclamationTriangle /> OUT OF STOCK
                    </span>
                  ) : (
                    <span className="bg-emerald-950/80 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-800 flex items-center gap-1">
                      <FaCheckCircle /> In Stock: {car.quantity} Units
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-white">{car.make} {car.model}</h3>
                <p className="text-amber-400 font-extrabold text-2xl my-2">₹{Number(car.price).toLocaleString("en-IN")}</p>
                <Link
                  to={`/cars/${car._id}`}
                  className={`w-full block py-2.5 rounded-xl font-bold text-center text-sm ${
                    isOut ? "bg-zinc-800 text-zinc-600 pointer-events-none" : "bg-amber-500 hover:bg-amber-400 text-black"
                  }`}
                >
                  {isOut ? "Unavailable" : "Inspect Vehicle & Purchase"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cars;
```

---

Now in `frontend/src/components/MyBookings.jsx`, let's add a printable Dealership Tax Invoice modal for completed purchases. When the user clicks "View Invoice", open a clean modal with invoice number, date, dealership GST, customer address, price, and 18% GST calculation, plus a "Print" button using `@media print` CSS so it prints on A4 cleanly.

Here is the printable invoice modal component for `MyBookings.jsx`:

```jsx
{activeInvoice && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:fixed print:inset-0">
    <div className="bg-white text-zinc-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl print:shadow-none print:w-full print:p-0">
      <div className="flex justify-between items-center pb-4 mb-6 border-b print:hidden">
        <h2 className="text-xl font-bold">Official Tax Invoice</h2>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg text-sm">
            🖨️ Print Invoice
          </button>
          <button onClick={() => setActiveInvoice(null)} className="px-4 py-2 bg-zinc-200 text-zinc-800 font-semibold rounded-lg text-sm">
            Close
          </button>
        </div>
      </div>

      <div id="printable-invoice" className="text-sm">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">RYDEX AUTOMOTIVE</h1>
            <p className="text-xs text-zinc-500">GSTIN: 07AAAAA0000A1Z5</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold">INV-{activeInvoice._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-zinc-500">{new Date(activeInvoice.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl border mb-6">
          <p className="text-xs font-bold text-zinc-400 uppercase">Customer Address:</p>
          <p className="font-bold text-zinc-800">{activeInvoice.customerName}</p>
          <p className="text-xs text-zinc-600">{activeInvoice.deliveryAddress}</p>
        </div>

        <div className="border-t pt-4 text-right space-y-1">
          <p className="text-xs">Subtotal: ₹{Number(activeInvoice.totalAmount * 0.82).toLocaleString("en-IN")}</p>
          <p className="text-xs">GST (18%): ₹{Number(activeInvoice.totalAmount * 0.18).toLocaleString("en-IN")}</p>
          <p className="font-bold text-lg text-emerald-600">Total Paid: ₹{Number(activeInvoice.totalAmount).toLocaleString("en-IN")}</p>
        </div>
      </div>
    </div>
  </div>
)}
```
