import express from "express";
import authMiddleware from "../middlewares/auth.js";
import {
  getBookings,
  getMyBookings,
  updatedBookingStatus,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.get("/", getBookings);
bookingRouter.get("/mybooking", authMiddleware, getMyBookings);
bookingRouter.get("/my-purchases", authMiddleware, getMyBookings);
bookingRouter.get("/my-bookings", authMiddleware, getMyBookings);
bookingRouter.patch("/:id/status", updatedBookingStatus);

export default bookingRouter;