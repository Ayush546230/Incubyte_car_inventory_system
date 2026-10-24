import Car from "../models/carModal.js";
import path from "path";
import fs from "fs";

// Helper to normalize vehicle output format
export const formatVehicle = (v) => {
  if (!v) return null;
  const obj = v.toObject ? v.toObject() : { ...v };
  const dailyRate = obj.dailyRate || 50;
  const price = obj.price !== undefined && obj.price !== null ? obj.price : dailyRate * 500;
  const quantity = obj.quantity !== undefined && obj.quantity !== null ? obj.quantity : 5;

  return {
    ...obj,
    id: obj._id,
    price,
    quantity,
    dailyRate,
  };
};

/**
 * Adds a new vehicle to the dealership inventory.
 * 
 * Steps:
 * 1. Validates that mandatory make and model fields are provided.
 * 2. Computes realistic price and daily rate if one was not passed.
 * 3. Saves uploaded image filename if an image file was attached via multer.
 * 4. Initializes inventory stock (default 5 units) with 'available' status.
 */
export const createVehicle = async (req, res, next) => {
  try {
    // Extract vehicle fields submitted in form
    const {
      make,
      model,
      category = "Sedan",
      price,
      dailyRate,
      quantity = 5,
      year = new Date().getFullYear(),
      color = "",
      seats = 4,
      transmission = "Automatic",
      fuelType = "Gasoline",
      mileage = 0,
      description = "",
      status = "available",
    } = req.body;

    // Validate essential vehicle identifiers
    if (!make || !model) {
      return res.status(400).json({
        success: false,
        message: "Make and model are required.",
      });
    }

    // Auto-compute price and daily rate if either was omitted
    const calculatedPrice = price !== undefined ? Number(price) : (dailyRate ? Number(dailyRate) * 500 : 25000);
    const calculatedDailyRate = dailyRate !== undefined ? Number(dailyRate) : Math.round(calculatedPrice / 500);
    const calculatedQty = Math.max(0, Number(quantity) || 0);

    // If an image file was uploaded via multer, use its saved filename
    let imageFilename = req.body.image || "";
    if (req.file) {
      imageFilename = req.file.filename;
    }

    // Create a new Car document in MongoDB
    const vehicle = new Car({
      make: String(make).trim(),
      model: String(model).trim(),
      category,
      price: calculatedPrice,
      dailyRate: calculatedDailyRate,
      quantity: calculatedQty,
      year: Number(year),
      color,
      seats: Number(seats),
      transmission,
      fuelType,
      mileage: Number(mileage),
      description,
      // If stock is 0 upon creation, mark status as sold_out
      status: calculatedQty === 0 ? "sold_out" : status,
      image: imageFilename,
    });

    // Save vehicle to database
    const saved = await vehicle.save();
    return res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle: formatVehicle(saved),
      data: formatVehicle(saved),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles
 * @desc    View a list of all available vehicles
 * @access  Public
 */
export const getVehicles = async (req, res, next) => {
  try {
    // Read pagination parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const { category, make, model, inStock } = req.query;

    // Build filter query object
    const query = {};
    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (make) query.make = { $regex: make, $options: "i" };
    if (model) query.model = { $regex: model, $options: "i" };
    // Filter out of stock items if inStock flag is passed
    if (inStock === "true") query.quantity = { $gt: 0 };

    // Get total document count for pagination calculations
    const total = await Car.countDocuments(query);

    // Fetch vehicles sorted by creation date
    const vehicles = await Car.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Format output with normalized prices and IDs
    const formatted = vehicles.map(formatVehicle);

    return res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
      data: formatted,
      vehicles: formatted,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles/search
 * @desc    Search for vehicles by make, model, category, or price range
 * @access  Public
 */
export const searchVehicles = async (req, res, next) => {
  try {
    const { make, model, category, minPrice, maxPrice, q, search } = req.query;
    const query = {};

    // Match generic search keyword against make, model, or category
    const searchTerm = q || search;
    if (searchTerm) {
      query.$or = [
        { make: { $regex: searchTerm, $options: "i" } },
        { model: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Specific field filters
    if (make) {
      query.make = { $regex: make, $options: "i" };
    }
    if (model) {
      query.model = { $regex: model, $options: "i" };
    }
    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Price range filters: minimum and maximum budget bounds
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Execute query, sort lowest price first
    const vehicles = await Car.find(query).sort({ price: 1, createdAt: -1 });
    const formatted = vehicles.map(formatVehicle);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      vehicles: formatted,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Public
 */
export const getVehicleById = async (req, res, next) => {
  try {
    // Look up vehicle by MongoDB ObjectId
    const vehicle = await Car.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }
    // Return formatted vehicle details
    return res.status(200).json(formatVehicle(vehicle));
  } catch (err) {
    next(err);
  }
};

/**
 * Updates vehicle details and cleans up old image files from disk.
 * 
 * Steps:
 * 1. Finds the vehicle by ID.
 * 2. If a new image was uploaded, deletes the old file to save server storage.
 * 3. Updates allowed fields and recalculates price or daily rate.
 * 4. Automatically marks vehicle as 'sold_out' if quantity reaches zero.
 */
export const updateVehicle = async (req, res, next) => {
  try {
    // Step 1: Look up vehicle document to update
    const vehicle = await Car.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Step 2: Handle image replacement and delete old image file from server storage
    if (req.file) {
      if (vehicle.image) {
        const oldPath = path.join(process.cwd(), "uploads", vehicle.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("Failed to delete old image:", err);
        });
      }
      vehicle.image = req.file.filename;
    } else if (req.body.image !== undefined) {
      if (!req.body.image && vehicle.image) {
        const oldPath = path.join(process.cwd(), "uploads", vehicle.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("Failed to delete old image:", err);
        });
        vehicle.image = "";
      } else if (req.body.image) {
        vehicle.image = req.body.image;
      }
    }

    // Step 3: Update editable attributes
    const fields = [
      "make",
      "model",
      "year",
      "color",
      "category",
      "seats",
      "transmission",
      "fuelType",
      "mileage",
      "price",
      "dailyRate",
      "quantity",
      "status",
      "description",
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (["year", "seats", "mileage", "dailyRate", "price", "quantity"].includes(f)) {
          vehicle[f] = Number(req.body[f]);
        } else {
          vehicle[f] = req.body[f];
        }
      }
    });

    // Step 4: Auto-synchronize price and dailyRate if only one was modified
    if (req.body.price !== undefined && req.body.dailyRate === undefined) {
      vehicle.dailyRate = Math.round(vehicle.price / 500);
    } else if (req.body.dailyRate !== undefined && req.body.price === undefined) {
      vehicle.price = vehicle.dailyRate * 500;
    }

    // Step 5: Automatically synchronize listing status with inventory stock
    if (vehicle.quantity <= 0) {
      vehicle.quantity = 0;
      vehicle.status = "sold_out";
    } else if (vehicle.status === "sold_out") {
      vehicle.status = "available";
    }

    // Save updated vehicle document
    const updated = await vehicle.save();
    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle: formatVehicle(updated),
      data: formatVehicle(updated),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete a vehicle (Admin only)
 * @access  Protected (Admin Only)
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    // Step 1: Remove vehicle from database
    const vehicle = await Car.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Step 2: Delete associated image file from server's uploads folder
    if (vehicle.image) {
      const filePath = path.join(process.cwd(), "uploads", vehicle.image);
      fs.unlink(filePath, (err) => {
        if (err) console.warn("Failed to delete image file:", err);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Purchases one or more units of a vehicle and updates inventory stock.
 * 
 * Steps:
 * 1. Finds the vehicle by ID.
 * 2. Checks if units are available in stock (currentQty > 0).
 * 3. Rejects if user requests more units than currently in stock.
 * 4. Deducts the purchased quantity. If stock becomes 0, marks status as 'sold_out'.
 */
export const purchaseVehicle = async (req, res, next) => {
  try {
    // Step 1: Look up vehicle
    const vehicle = await Car.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Step 2: Calculate current inventory quantity and requested units
    const currentQty = vehicle.quantity !== undefined ? vehicle.quantity : 5;
    const purchaseCount = Math.max(1, Number(req.body.quantity) || 1);

    // Guard: Check if completely out of stock
    if (currentQty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is currently out of stock",
      });
    }

    // Guard: Check if requested quantity exceeds in-stock availability
    if (currentQty < purchaseCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${currentQty} units available in stock. Cannot purchase ${purchaseCount}.`,
      });
    }

    // Step 3: Deduct purchased units from live inventory
    vehicle.quantity = currentQty - purchaseCount;
    // If stock hits 0, update listing status to sold_out
    if (vehicle.quantity === 0) {
      vehicle.status = "sold_out";
    }

    // Save inventory changes
    const updated = await vehicle.save();
    return res.status(200).json({
      success: true,
      message: `Successfully purchased ${vehicle.make} ${vehicle.model}!`,
      vehicle: formatVehicle(updated),
      purchasedUnits: purchaseCount,
      remainingStock: updated.quantity,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Restocks a vehicle by adding fresh units to inventory (Admin only).
 * 
 * Steps:
 * 1. Finds the vehicle by ID.
 * 2. Increments the vehicle quantity by the restocked count.
 * 3. If the vehicle was previously 'sold_out', restores status back to 'available'.
 */
export const restockVehicle = async (req, res, next) => {
  try {
    // Step 1: Look up vehicle
    const vehicle = await Car.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Step 2: Determine restock increment amount
    const restockCount = Math.max(1, Number(req.body.quantity) || 1);
    const currentQty = vehicle.quantity !== undefined ? vehicle.quantity : 0;

    // Step 3: Add new stock units
    vehicle.quantity = currentQty + restockCount;
    // If vehicle was marked sold_out, switch status back to available
    if (vehicle.status === "sold_out") {
      vehicle.status = "available";
    }

    // Save restocked vehicle
    const updated = await vehicle.save();
    return res.status(200).json({
      success: true,
      message: `Restocked ${restockCount} units of ${vehicle.make} ${vehicle.model}. New quantity: ${updated.quantity}`,
      vehicle: formatVehicle(updated),
      restockedUnits: restockCount,
      totalStock: updated.quantity,
    });
  } catch (err) {
    next(err);
  }
};
