import express from "express";
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from "../controllers/vehicleController.js";
import authMiddleware, { adminOnly } from "../middlewares/auth.js";
import { uploads } from "../middlewares/uploads.js";

const vehicleRouter = express.Router();

// Search route must be defined before :id route!
vehicleRouter.get("/search", searchVehicles);

// Core Vehicles routes
vehicleRouter.get("/", getVehicles);
vehicleRouter.get("/:id", getVehicleById);
vehicleRouter.post("/", uploads.single("image"), createVehicle);
vehicleRouter.put("/:id", uploads.single("image"), updateVehicle);
vehicleRouter.delete("/:id", adminOnly, deleteVehicle);

// Inventory routes (Protected)
vehicleRouter.post("/:id/purchase", authMiddleware, purchaseVehicle);
vehicleRouter.post("/:id/restock", adminOnly, restockVehicle);

export default vehicleRouter;
